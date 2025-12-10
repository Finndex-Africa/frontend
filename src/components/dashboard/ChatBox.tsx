"use client";

import { useEffect, useState } from "react";
import { initChat } from "@/lib/chatClient";
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

export default function ChatBox({ userId, landlordId, propertyId }) {
    const [client, setClient] = useState(null);
    const [channel, setChannel] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let mounted = true;
        let channelInstance = null;

        const setup = async () => {
            try {
                // Reset states
                setClient(null);
                setChannel(null);
                setError(null);

                // Initialize chat client
                const chat = await initChat(userId);

                // Create or get channel
                const res = await fetch("/api/chat/channel", {
                    method: "POST",
                    body: JSON.stringify({ landlordId, clientId: userId, propertyId }),
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to create chat channel');
                }

                const { channelId } = await res.json();

                // Get the channel instance
                channelInstance = chat.channel("messaging", channelId);
                await channelInstance.watch();

                if (mounted) {
                    setClient(chat);
                    setChannel(channelInstance);
                }
            } catch (err) {
                console.error('Chat initialization error:', err);
                if (mounted) {
                    setError(err.message || 'Failed to load chat');
                }
            }
        };

        setup();

        return () => {
            mounted = false;
            // Clean up channel subscription
            if (channelInstance) {
                channelInstance.stopWatching().catch(console.error);
            }
        };
    }, [userId, landlordId, propertyId, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    if (error) {
        return (
            <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">No chat conversation yet</p>
                            <p className="text-xs text-yellow-700 mt-1">Start a conversation with the landlord by clicking the button below.</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleRetry}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Start New Conversation
                </button>
            </div>
        );
    }

    if (!client || !channel) {
        return (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-sm text-gray-600">Connecting to chat...</p>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Chat client={client} theme="str-chat__theme-light">
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
}
