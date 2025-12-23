import { apiClient } from '@/lib/api-client';

export interface MessageThread {
    _id: string;
    participants: Array<{
        _id: string;
        name: string;
        avatar?: string;
        email: string;
    }>;
    relatedItem?: {
        type: string;
        id: string;
        title: string;
    };
    lastMessage?: {
        text: string;
        timestamp: Date;
        from: string;
    };
    createdAt: Date;
    updatedAt: Date;
    isArchived?: boolean;
}

export interface Message {
    _id: string;
    threadId: string;
    from: string;
    text: string;
    attachments?: Array<{
        url: string;
        type: string;
    }>;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateThreadDto {
    participants: string[];
    relatedItem?: {
        type: string;
        id: string;
        title: string;
    };
}

export interface SendMessageDto {
    threadId: string;
    text: string;
    attachments?: Array<{
        url: string;
        type: string;
    }>;
}

export interface EditMessageDto {
    text: string;
}

export const messagesApi = {
    // Get all threads for current user
    getThreads: async (includeArchived?: boolean) => {
        const params = new URLSearchParams();
        if (includeArchived) params.append('includeArchived', 'true');
        return apiClient.get<MessageThread[]>(`/messages/threads?${params.toString()}`);
    },

    // Get specific thread
    getThread: async (threadId: string) => {
        return apiClient.get<MessageThread>(`/messages/threads/${threadId}`);
    },

    // Get messages in a thread
    getMessages: async (threadId: string, page?: number, limit?: number) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page.toString());
        if (limit) params.append('limit', limit.toString());
        return apiClient.get<{ data: Message[]; total: number }>(`/messages/threads/${threadId}/messages?${params.toString()}`);
    },

    // Create new thread
    createThread: async (data: CreateThreadDto) => {
        return apiClient.post<MessageThread>('/messages/threads', data);
    },

    // Send message
    sendMessage: async (data: SendMessageDto) => {
        return apiClient.post<Message>('/messages/send', data);
    },

    // Edit message
    editMessage: async (messageId: string, data: EditMessageDto) => {
        return apiClient.patch<Message>(`/messages/messages/${messageId}`, data);
    },

    // Delete message
    deleteMessage: async (messageId: string) => {
        return apiClient.delete<void>(`/messages/messages/${messageId}`);
    },

    // Archive thread
    archiveThread: async (threadId: string) => {
        return apiClient.patch<MessageThread>(`/messages/threads/${threadId}/archive`, {});
    },

    // Unarchive thread
    unarchiveThread: async (threadId: string) => {
        return apiClient.patch<MessageThread>(`/messages/threads/${threadId}/unarchive`, {});
    },

    // Mark thread as read
    markAsRead: async (threadId: string) => {
        return apiClient.patch<MessageThread>(`/messages/threads/${threadId}/read`, {});
    },
};
