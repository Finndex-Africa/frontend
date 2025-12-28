"use client";

import { useEffect, useState } from "react";
import {
    Chat, Channel, Window, MessageList, MessageInput, Thread
} from "stream-chat-react";
import type { Channel as ChannelType } from "stream-chat";

import { getStreamClient } from "@/lib/streamClient";
import { use } from "react";

interface ChatPageProps {
    params: Promise<{ channelId: string }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const { channelId } = use(params);
    const client = getStreamClient();
    const [channel, setChannel] = useState<ChannelType | null>(null);

    useEffect(() => {
        async function init() {
            const userId = "CURRENT_USER_ID"; // Replace with auth userId

            // 1. Get token from Nest backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/token`, {
                method: "POST",
                body: JSON.stringify({ userId }),
                headers: { "Content-Type": "application/json" }
            });

            const { token } = await res.json();

            // 2. Connect user
            await client.connectUser(
                { id: userId },
                token
            );

            // 3. Create the channel reference
            const ch = client.channel("messaging", channelId);
            await ch.watch();
            setChannel(ch);
        }

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channelId]);

    if (!channel) return <p>Loading chat...</p>;

    return (
        <Chat client={client} theme="messaging light">
            <Channel channel={channel}>
                <Window>
                    <MessageList />
                    <MessageInput />
                </Window>
                <Thread />
            </Channel>
        </Chat>
    );
}
