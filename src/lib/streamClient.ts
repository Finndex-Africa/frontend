import { StreamChat } from "stream-chat";

let client: StreamChat | null = null;

export function getStreamClient(): StreamChat {
    if (!client) {
        const apiKey = process.env.NEXT_PUBLIC_STREAM_KEY;

        if (!apiKey) {
            throw new Error("Stream API key not configured");
        }

        client = StreamChat.getInstance(apiKey);
    }

    return client;
}
