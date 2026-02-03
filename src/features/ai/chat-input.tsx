import React from 'react';
import { Button } from '../../components/ui/button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChange, onSend, disabled = false }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask me anything about music production..."
        className="flex-1 bg-surface-800 border border-surface-700 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        rows={3}
        disabled={disabled}
      />
      <Button type="submit" disabled={!value.trim() || disabled} className="self-end">
        Send
      </Button>
    </form>
  );
}
