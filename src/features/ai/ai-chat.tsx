import { useState } from 'react';
import { ProviderSelector } from './provider-selector';
import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { useAI } from '@/hooks/use-ai';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { complete, isLoading, error } = useAI();

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    try {
      // Convert messages to ChatMessage format for IPC
      const chatMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await complete(chatMessages);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI completion error:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error || 'Failed to get AI response'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between p-4 bg-surface-800 border border-surface-700 rounded-lg">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        <ProviderSelector />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <MessageList messages={messages} />

      <ChatInput
        value={inputText}
        onChange={setInputText}
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  );
}
