"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string };

/** Quick-reply chips, per section 34 of the FAQ document. */
const QUICK_REPLY_KEYS = [
  "findProperty",
  "findService",
  "postListing",
  "becomeAgent",
  "becomeProvider",
  "buyAndSell",
  "verification",
  "support",
] as const;

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

/**
 * Minimal renderer for the assistant's markdown-ish output: bullets, bold, and
 * in-site links. Deliberately not `dangerouslySetInnerHTML` and deliberately not
 * a markdown dependency — model output is untrusted text, so it stays text.
 */
function RichText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    blocks.push(
      <ul key={key} className="list-disc pl-5 space-y-1">
        {bullets.map((item, i) => (
          <li key={i}>
            <Inline text={item} />
          </li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  lines.forEach((line, index) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      return;
    }
    flushBullets(`ul${index}`);
    if (line.trim() === "") return;
    blocks.push(
      <p key={`p${index}`}>
        <Inline text={line} />
      </p>,
    );
  });
  flushBullets("ul-last");

  return <div className="space-y-2">{blocks}</div>;
}

const LINK_CLASS =
  "text-blue-600 underline underline-offset-2 hover:no-underline break-words";

/**
 * Handles the three inline forms the model actually produces: markdown links
 * `[label](/path)`, `**bold**`, and bare `/routes/...` paths.
 *
 * Markdown links are the common case — asking the model to stop emitting them
 * would be fighting its natural output for no gain, so they are parsed instead.
 */
function Inline({ text }: { text: string }) {
  const pattern =
    /\[([^\]]+)\]\((\/[a-z0-9\-/]*routes\/[a-z0-9\-/]*)\)|\*\*(.+?)\*\*|((?:\/(?:en|fr))?\/routes\/[a-z0-9\-/]+)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  // next-intl's Link prepends the active locale, so strip any the model added
  // or the href ends up as /fr/fr/routes/...
  const strip = (href: string) => href.replace(/^\/(?:en|fr)(?=\/)/, "");

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    const [, linkLabel, linkHref, bold, barePath] = match;
    if (linkHref !== undefined) {
      parts.push(
        <Link key={key++} href={strip(linkHref)} className={LINK_CLASS}>
          {linkLabel}
        </Link>,
      );
    } else if (bold !== undefined) {
      parts.push(<strong key={key++}>{bold}</strong>);
    } else {
      parts.push(
        <Link key={key++} href={strip(barePath)} className={LINK_CLASS}>
          {strip(barePath)}
        </Link>,
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));

  return <>{parts}</>;
}

export default function AssistantWidget() {
  const t = useTranslations("assistant");
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Follow the stream as it arrives.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Drop any in-flight request if the widget unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;

      setError(null);
      setInput("");

      const userMessage: Message = { id: nextId(), role: "user", content: text };
      const replyId = nextId();

      // Snapshot the history we are actually sending, so the request body does
      // not depend on state that may have moved on.
      const history = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: replyId, role: "assistant", content: "" },
      ]);
      setPending(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history, locale }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const code = res.status === 429 ? "rateLimited" : "generic";
          setError(t(`errors.${code}`));
          setMessages((prev) => prev.filter((m) => m.id !== replyId));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let received = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === replyId ? { ...m, content: received } : m)),
          );
        }

        if (received.trim() === "") {
          setError(t("errors.generic"));
          setMessages((prev) => prev.filter((m) => m.id !== replyId));
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(t("errors.network"));
        setMessages((prev) => prev.filter((m) => m.id !== replyId));
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    },
    [messages, pending, locale, t],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <>
      {/* Sits above WhatsAppFloat, which occupies bottom-20 / md:bottom-6. */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("open")}
          className="fixed bottom-40 right-6 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 md:bottom-28 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 md:w-8 md:h-8"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {t("tooltip")}
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={t("title")}
          className="fixed z-50 flex flex-col bg-white shadow-2xl inset-x-0 bottom-0 top-16 rounded-t-2xl sm:inset-auto sm:top-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:rounded-2xl overflow-hidden border border-gray-200"
        >
          <header className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shrink-0">
            <div>
              <p className="font-bold leading-tight">{t("title")}</p>
              <p className="text-xs text-blue-100">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="p-1 rounded hover:bg-white/20 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-sm text-gray-800"
            aria-live="polite"
            aria-atomic="false"
          >
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
              <RichText text={t("greeting")} />
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_REPLY_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => void send(t(`quickReplies.${key}`))}
                    className="px-3 py-1.5 text-xs font-medium border border-blue-600 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    {t(`quickReplies.${key}`)}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div
                  key={message.id}
                  className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[95%] break-words"
                >
                  {message.content ? (
                    <RichText text={message.content} />
                  ) : (
                    <span className="inline-flex gap-1 py-1" aria-label={t("thinking")}>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                    </span>
                  )}
                </div>
              ),
            )}

            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}
          </div>

          <form
            onSubmit={onSubmit}
            className="shrink-0 border-t border-gray-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={2000}
                placeholder={t("placeholder")}
                aria-label={t("placeholder")}
                className="flex-1 resize-none max-h-28 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={pending || input.trim() === ""}
                aria-label={t("send")}
                className="shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-tight text-gray-500">
              {t("disclaimer")}
            </p>
          </form>
        </div>
      )}
    </>
  );
}
