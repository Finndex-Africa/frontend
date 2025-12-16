import { StreamChat } from "stream-chat";

let client: StreamChat | null = null;

export async function initChat(userId: string, userName?: string, userImage?: string) {
    if (!client) {
        // Get the API key from environment
        const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;

        if (!apiKey) {
            throw new Error("Stream API key not configured");
        }

        // Initialize the client
        client = StreamChat.getInstance(apiKey);

        // Get user token from backend
        const response = await fetch('/api/chat/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, userName, userImage }),
        });

        if (!response.ok) {
            throw new Error('Failed to get chat token');
        }

        const { token } = await response.json();

        // Connect the user with proper name and image
        await client.connectUser(
            {
                id: userId,
                name: userName || userId,
                image: userImage,
            },
            token
        );
    }

    return client;
}

export function getChatClient() {
    if (!client) {
        throw new Error("Chat client not initialized");
    }
    return client;
}

export async function disconnectChat() {
    if (client) {
        await client.disconnectUser();
        client = null;
    }
}
