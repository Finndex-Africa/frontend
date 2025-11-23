"use client";
import React, { useState, useRef } from "react";

type Message = { id: string; from: "me" | "other"; text: string; at: string };

export default function MessageThread({ initial = [] as Message[] }: { initial?: Message[] }) {
    const [messages, setMessages] = useState<Message[]>(initial);
    const [text, setText] = useState("");
    const idCounter = useRef(0);

    const send = () => {
        if (!text.trim()) return;
        const timestamp = new Date().toISOString();
        setMessages((m) => [...m, { id: `msg-${++idCounter.current}`, from: "me", text, at: timestamp }]);
        setText("");
    };

    return (
        <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Send a message</h3>
            <div className="flex-1 max-h-48 overflow-y-auto space-y-2 mb-3 pr-1">
                {messages.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No messages yet. Start a conversation!</p>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className={`max-w-[80%] ${m.from === "me" ? "ml-auto" : ""}`}>
                            <div className={`rounded-lg px-3 py-2 text-xs ${m.from === "me" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>{m.text}</div>
                        </div>
                    ))
                )}
            </div>
            <div className="flex gap-2">
                <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                    placeholder="Type a message..."
                />
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={send}
                    disabled={!text.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
}



