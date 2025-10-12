'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageThread, Message } from '@/lib/api/types';
import { messagesService, SendMessageData } from '@/lib/api/services';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User, ArrowLeft } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread._id);
    }
  }, [selectedThread]);

  const loadThreads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await messagesService.getThreads();
      setThreads(data);
    } catch (err) {
      console.error('Failed to load threads:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const data = await messagesService.getMessages(threadId);
      setMessages(data);
      await messagesService.markAsRead(threadId);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedThread) return;

    try {
      setIsSending(true);
      const messageData: SendMessageData = {
        text: messageText,
      };
      const newMessage = await messagesService.sendMessage(selectedThread._id, messageData);
      setMessages([...messages, newMessage]);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (thread: MessageThread) => {
    return thread.participants.find((p) => p._id !== user?._id);
  };

  const getUnreadCount = (thread: MessageThread) => {
    return thread.unreadCount[user?._id || ''] || 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with property owners and service providers</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-20rem)]">
          {/* Threads List */}
          <div className={`border-r border-gray-200 overflow-y-auto ${selectedThread ? 'hidden lg:block' : ''}`}>
            {threads.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 text-sm">
                  Start a conversation by inquiring about a property or service
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {threads.map((thread) => {
                  const otherUser = getOtherParticipant(thread);
                  const unread = getUnreadCount(thread);

                  return (
                    <button
                      key={thread._id}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedThread?._id === thread._id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {otherUser?.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User size={24} className="text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherUser?.name || otherUser?.email || 'Unknown User'}
                            </h3>
                            {unread > 0 && (
                              <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                {unread}
                              </span>
                            )}
                          </div>
                          {thread.relatedItem && (
                            <p className="text-xs text-gray-500 mb-1">
                              Re: {thread.relatedItem.title}
                            </p>
                          )}
                          {thread.lastMessage && (
                            <>
                              <p className="text-sm text-gray-600 truncate">
                                {thread.lastMessage.text}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(thread.lastMessage.timestamp).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages View */}
          <div className={`lg:col-span-2 flex flex-col ${!selectedThread ? 'hidden lg:flex' : ''}`}>
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="lg:hidden text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {getOtherParticipant(selectedThread)?.avatar ? (
                      <img
                        src={getOtherParticipant(selectedThread)!.avatar}
                        alt={getOtherParticipant(selectedThread)!.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getOtherParticipant(selectedThread)?.name ||
                        getOtherParticipant(selectedThread)?.email ||
                        'Unknown User'}
                    </h3>
                    {selectedThread.relatedItem && (
                      <p className="text-xs text-gray-500">Re: {selectedThread.relatedItem.title}</p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.from._id === user?._id;

                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-xl px-4 py-2 ${
                            isOwn
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-orange-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={isSending || !messageText.trim()}
                      className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div>
                  <MessageSquare className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a message thread from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
