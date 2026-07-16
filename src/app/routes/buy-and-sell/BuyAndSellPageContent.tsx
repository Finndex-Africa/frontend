"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface StoredUser {
  email?: string;
  phoneNumber?: string;
  username?: string;
  firstName?: string;
}

type ModalState = "idle" | "email-prompt" | "success" | "error";

export default function BuyAndSellPageContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [modalMessage, setModalMessage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const user =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (token && user) {
      try {
        const parsed: StoredUser = JSON.parse(user);
        setStoredUser(parsed);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const handleNotifyMe = () => {
    if (isMounted && isLoggedIn && storedUser) {
      submitNotification({
        email: storedUser.email || "",
        phoneNumber: storedUser.phoneNumber,
        username: storedUser.username || storedUser.firstName,
        isUser: true,
      });
    } else {
      setEmailInput("");
      setNameInput("");
      setPhoneInput("");
      setEmailError("");
      setModalState("email-prompt");
    }
  };

  const submitNotification = async (body: {
    email: string;
    phoneNumber?: string;
    username?: string;
    isUser?: boolean;
  }) => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/notify-me`, body);
      setModalMessage(
        "You're on the list! We'll notify you when the Buy & Sell feature is live."
      );
      setModalState("success");
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setModalMessage(
          "You're already on the list! We'll notify you when the feature goes live."
        );
        setModalState("success");
      } else {
        const msg =
          err?.response?.data?.message ||
          "Something went wrong. Please try again.";
        setModalMessage(msg);
        setModalState("error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    submitNotification({
      email: trimmed,
      username: nameInput.trim() || undefined,
      phoneNumber: phoneInput.trim() || undefined,
      isUser: false,
    });
  };

  const closeModal = () => {
    setModalState("idle");
    setEmailInput("");
    setNameInput("");
    setPhoneInput("");
    setEmailError("");
    setModalMessage("");
  };

  const features = [
    {
      image: "/icons/land.png",
      title: "Buy & Sell Land",
      description: "Find or list land properties for sale with ease.",
      color: "bg-green-50 border-green-100",
      titleColor: "text-green-700",
    },
    {
      image: "/icons/house.png",
      title: "Buy & Sell Houses",
      description: "Discover homes or list your property for potential buyers.",
      color: "bg-blue-50 border-blue-100",
      titleColor: "text-blue-700",
    },
    {
      image: "/icons/items.png",
      title: "Buy & Sell Items",
      description: "Buy and sell fairly used household items easily.",
      color: "bg-orange-50 border-orange-100",
      titleColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Hero section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="mb-6 flex justify-center">
          <Image
            src="/icons/shopping.png"
            alt="Buy & Sell"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
          Buy &amp; Sell Feature
        </h1>
        <p className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-6">
          Coming Soon!
        </p>
        <p className="text-lg text-gray-600 max-w-xl">
          We&apos;re building something amazing! Soon, you&apos;ll be able to
          buy and sell land, houses, and fairly used household items — all in
          one place.
        </p>

        {/* Notify Me banner */}
        <div className="mt-10 w-full max-w-xl bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Stay tuned for updates!
              </p>
              <p className="text-xs text-gray-500">
                We&apos;ll notify you as soon as the Buy &amp; Sell feature is
                live.
              </p>
            </div>
          </div>
          <button
            onClick={handleNotifyMe}
            disabled={isSubmitting}
            className="shrink-0 flex items-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            Notify Me
          </button>
        </div>
      </section>

      {/* What you'll be able to do */}
      <section className="w-full max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-8">
          What you&apos;ll be able to do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border p-5 flex flex-row items-start gap-4 ${f.color}`}
            >
              <div className="w-20 h-20 shrink-0">
                <Image
                  src={f.image}
                  alt={f.title}
                  width={80}
                  height={80}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <h3 className={`font-bold text-base ${f.titleColor}`}>
                  {f.title}
                </h3>
                <p className="text-sm text-gray-600">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Have something to sell?
              </p>
              <p className="text-xs text-gray-500">
                Be the first to know when Buy &amp; Sell goes live and start
                reaching thousands of buyers.
              </p>
            </div>
          </div>
          <button
            onClick={handleNotifyMe}
            disabled={isSubmitting}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
          >
            Notify Me
          </button>
        </div>
      </section>

      {/* Modal */}
      {modalState !== "idle" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            {modalState === "email-prompt" && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Get Notified</h3>
                    <p className="text-sm text-gray-500">
                      Enter your email to be notified when Buy &amp; Sell goes
                      live.
                    </p>
                  </div>
                </div>
                <form onSubmit={handleEmailSubmit} noValidate className="space-y-3">
                  {/* Email — required */}
                  <div>
                    <label
                      htmlFor="notify-email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="notify-email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                      autoFocus
                    />
                    {emailError && (
                      <p className="mt-1 text-xs text-red-600">{emailError}</p>
                    )}
                  </div>

                  {/* Name — optional */}
                  <div>
                    <label
                      htmlFor="notify-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="notify-name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Phone — optional */}
                  <div>
                    <label
                      htmlFor="notify-phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone number <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="notify-phone"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+250788000000"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {isSubmitting ? "Submitting…" : "Notify Me"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalState === "success" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  You&apos;re on the list!
                </h3>
                <p className="text-gray-600 text-sm mb-6">{modalMessage}</p>
                <button
                  onClick={closeModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {modalState === "error" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  Something went wrong
                </h3>
                <p className="text-gray-600 text-sm mb-6">{modalMessage}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={closeModal}
                    className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setModalState("email-prompt");
                      setModalMessage("");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
