import { StreamChat } from "stream-chat";

let client: StreamChat | null = null;

export function initChat(apiKey: string) {
    if (!client) {
        client = StreamChat.getInstance(apiKey);
    }
    return client;
}

export function getChatClient() {
    if (!client) {
        throw new Error("Chat client not initialized");
    }
    return client;
}
