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

    useEffect(() => {
        const setup = async () => {
            const chat = await initChat(userId);

            const res = await fetch("/api/chat/channel", {
                method: "POST",
                body: JSON.stringify({ landlordId, clientId: userId, propertyId }),
                headers: { "Content-Type": "application/json" },
            });

            const { channelId } = await res.json();

            const channelInstance = chat.channel("messaging", channelId, {});
            await channelInstance.watch();

            setClient(chat);
            setChannel(channelInstance);
        };

        setup();
    }, []);

    if (!client || !channel) return <p>Loading chat...</p>;

    return (
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
    );
}
