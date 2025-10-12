import apiClient from '../client';
import { ApiResponse, MessageThread, Message } from '../types';

export interface CreateThreadData {
  recipientId: string;
  itemType: string;
  itemId: string;
  initialMessage: string;
}

export interface SendMessageData {
  text: string;
  attachments?: string[];
}

export const messagesService = {
  async getThreads(): Promise<MessageThread[]> {
    const { data } = await apiClient.get<ApiResponse<MessageThread[]>>('/messages');
    return data.data!;
  },

  async getMessages(threadId: string): Promise<Message[]> {
    const { data } = await apiClient.get<ApiResponse<Message[]>>(`/messages/${threadId}`);
    return data.data!;
  },

  async sendMessage(threadId: string, messageData: SendMessageData): Promise<Message> {
    const { data } = await apiClient.post<ApiResponse<Message>>(`/messages/${threadId}`, messageData);
    return data.data!;
  },

  async initiateThread(threadData: CreateThreadData): Promise<MessageThread> {
    const { data} = await apiClient.post<ApiResponse<MessageThread>>('/messages/initiate', threadData);
    return data.data!;
  },

  async markAsRead(threadId: string): Promise<void> {
    await apiClient.put(`/messages/${threadId}/read`);
  },
};
