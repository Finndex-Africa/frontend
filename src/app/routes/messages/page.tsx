'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { StreamChat } from 'stream-chat';
import {
    Chat,
    ChannelList,
    Channel,
    Window,
    ChannelHeader,
    MessageList,
    MessageInput,
    Thread,
    ChannelPreviewUIComponentProps,
    useChatContext,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

// Custom channel preview component
const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
    const { channel, setActiveChannel, activeChannel } = props;
    const { client } = useChatContext();

    if (!channel) return null;
    if (!client) return null;

    const isActive = activeChannel?.id === channel.id;
    const members = Object.values(channel.state.members).filter(
        (member) => member.user?.id !== client.user?.id
    );

    const otherUser = members[0]?.user;
    const displayName = otherUser?.name || otherUser?.id || 'Unknown User';
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];
    const lastMessageText = lastMessage?.text || 'No messages yet';
    const unreadCount = channel.countUnread();

    // Format timestamp
    const formatTime = (date?: Date | string) => {
        if (!date) return '';

        const messageDate = new Date(date);
        const now = new Date();
        const diff = now.getTime() - messageDate.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return messageDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }

        if (hours < 48) {
            return 'Yesterday';
        }

        return messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const handleClick = () => {
        setActiveChannel?.(channel);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                p-4 cursor-pointer transition-all border-b border-gray-100
                ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'}
            `}
        >
            <div className="flex items-start gap-3">
                <div className="relative">
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                        </div>
                    )}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden relative">
                        {otherUser?.image ? (
                            <Image
                                src={otherUser.image}
                                alt={displayName}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            displayName.charAt(0).toUpperCase()
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span
                            className={`text-sm font-semibold truncate ${isActive ? 'text-blue-600' : 'text-gray-900'
                                }`}
                        >
                            {displayName}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(lastMessage?.created_at)}
                        </span>
                    </div>

                    <p
                        className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                            }`}
                    >
                        {lastMessageText}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function MessagesPage() {
    const [client, setClient] = useState<StreamChat | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!userData) {
            setLoading(false);
            setError('Please log in to view messages');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const initializeChat = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get Stream API key from environment
                const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;
                if (!apiKey) {
                    throw new Error('Stream Chat API key not configured');
                }

                // Create Stream Chat client
                const chatClient = StreamChat.getInstance(apiKey);

                // Get auth token from backend
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: parsedUser._id }),
                });

                if (!response.ok) {
                    throw new Error('Failed to get chat token');
                }

                const { token } = await response.json();

                // Connect user to Stream with name and avatar
                await chatClient.connectUser(
                    {
                        id: parsedUser._id,
                        name: `${parsedUser.firstName || ''} ${parsedUser.lastName || ''}`.trim() || parsedUser.email?.split('@')[0] || 'User',
                        image: parsedUser.avatar || undefined,
                    },
                    token
                );

                setClient(chatClient);
            } catch (err) {
                console.error('Chat initialization error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load chat');
            } finally {
                setLoading(false);
            }
        };

        initializeChat();

        // Cleanup on unmount
        return () => {
            if (client) {
                client.disconnectUser().catch(console.error);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="px-4 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
                        <p className="mt-2 text-gray-600">Communicate with property owners and service providers</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                        <svg
                            className="mx-auto h-20 w-20 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <h3 className="mt-6 text-xl font-semibold text-gray-900">{error || 'Please log in'}</h3>
                        <p className="mt-3 text-gray-600 text-base">
                            {error || 'Please log in to view messages'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="px-4 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
                        <p className="mt-2 text-gray-600">Communicate with property owners and service providers</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">Unable to connect to chat service</h3>
                    </div>
                </div>
            </div>
        );
    }

    // Filter channels where current user is a member
    const filters = {
        type: 'messaging',
        members: { $in: [user._id] },
    };

    const sort = [{ last_message_at: -1 }] as const;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="px-4 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
                    <p className="mt-2 text-gray-600">Communicate with property owners and service providers</p>
                </div>

                <div
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
                    style={{
                        height: 'calc(100vh - 240px)',
                        minHeight: '600px'
                    }}
                >
                    <Chat client={client} theme="str-chat__theme-light">
                        <div style={{ display: 'flex', height: '100%' }}>
                            {/* Left sidebar - Channel List */}
                            <div style={{
                                width: '360px',
                                borderRight: '1px solid #e8e8e8',
                                flexShrink: 0,
                                overflow: 'hidden'
                            }}>
                                <ChannelList
                                    filters={filters}
                                    sort={sort}
                                    options={{ limit: 20 }}
                                    Preview={CustomChannelPreview}
                                    EmptyStateIndicator={() => (
                                        <div className="flex flex-col items-center justify-center py-16 px-4">
                                            <svg
                                                className="w-20 h-20 text-gray-300 mb-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                />
                                            </svg>
                                            <p className="text-center text-gray-600 font-medium">
                                                No messages yet
                                            </p>
                                            <p className="text-center text-gray-500 text-sm mt-1">
                                                Your conversations will appear here
                                            </p>
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Right side - Active Chat */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Channel>
                                    <Window>
                                        <ChannelHeader />
                                        <MessageList />
                                        <MessageInput />
                                    </Window>
                                    <Thread />
                                </Channel>
                            </div>
                        </div>
                    </Chat>
                </div>
            </div>
        </div>
    );
}
