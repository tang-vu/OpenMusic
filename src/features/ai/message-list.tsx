import { useEffect, useRef } from 'react';
import { Message } from './ai-chat';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-800 border border-surface-700 rounded-lg">
        <div className="text-center">
          <p className="text-gray-400 mb-2">No messages yet</p>
          <p className="text-sm text-gray-500">Start a conversation with the AI assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-surface-800 border border-surface-700 rounded-lg p-4 space-y-4"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-primary-500 text-white'
                : 'bg-surface-700 text-gray-100'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p className={`text-xs mt-1 ${
              message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
