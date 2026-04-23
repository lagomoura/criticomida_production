'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage, sendChatMessage } from '../lib/api/chat';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    '¡Hola! Soy el asistente de CritiComida. Pregúntame sobre restaurantes o platos que tenemos registrados.',
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-neutral-200 px-4 py-3 dark:bg-neutral-700">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-neutral-500"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-neutral-500"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-neutral-500"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter((m) => m !== WELCOME_MESSAGE);
      const reply = await sendChatMessage(text, [...history, userMessage]);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-6 z-[1100] hidden w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex dark:bg-neutral-800"
          style={{ height: '480px' }}
          role="dialog"
          aria-label="Chat con CritiComida"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-main-pink px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍽️</span>
              <span className="font-semibold text-white">CritiComida Bot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="cc-btn-close !bg-white/20 !text-white hover:!bg-white/30"
              aria-label="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-main-pink text-white'
                      : 'rounded-bl-sm bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 p-3 dark:border-neutral-700">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                rows={1}
                className="form-control flex-1 resize-none text-sm"
                style={{ minHeight: '38px', maxHeight: '96px' }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="btn btn-primary shrink-0 px-3 py-2 text-sm disabled:opacity-50"
                aria-label="Enviar mensaje"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[1100] hidden h-14 w-14 items-center justify-center rounded-full bg-main-pink text-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 md:flex"
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
