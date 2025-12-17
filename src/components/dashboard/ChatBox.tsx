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
import type { StreamChat, Channel as ChannelType } from "stream-chat";
import "stream-chat-react/dist/css/v2/index.css";

interface ChatBoxProps {
    userId: string;
    landlordId: string;
    propertyId: string;
}

export default function ChatBox({ userId, landlordId, propertyId }: ChatBoxProps) {
    const [client, setClient] = useState<StreamChat | null>(null);
    const [channel, setChannel] = useState<ChannelType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let mounted = true;
        let channelInstance: ChannelType | null = null;

        const setup = async () => {
            if (!isInitialized) return;

            try {
                // Reset states
                setClient(null);
                setChannel(null);
                setError(null);

                // Validate required fields
                if (!userId || !landlordId || !propertyId) {
                    throw new Error('Missing required information. Please refresh the page.');
                }

                if (userId === landlordId) {
                    throw new Error('You cannot chat with yourself.');
                }
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
                    setError(err instanceof Error ? err.message : 'Failed to load chat');
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
    }, [userId, landlordId, propertyId, retryCount, isInitialized]);

    const handleStartConversation = () => {
        setIsInitialized(true);
    };

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    if (error) {
        return (
            <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">Unable to load chat</p>
                            <p className="text-xs text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleRetry}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry Connection
                </button>
            </div>
        );
    }

    // Show "Start Conversation" button if not initialized
    if (!isInitialized) {
        return (
            <button
                onClick={handleStartConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Start New Conversation
            </button>
        );
    }

    // Show loading state while connecting
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
