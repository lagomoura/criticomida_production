'use client';

import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { ChatMessage, sendChatMessage } from '../lib/api/chat';
import { cn } from '../lib/utils/cn';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    'Hola, soy el asistente de CritiComida. Preguntame sobre platos o restaurantes que tengamos registrados.',
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-surface-subtle px-4 py-3">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-text-muted"
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
          content: 'Algo salió mal. Probá de nuevo en un momento.',
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
          className={cn(
            'fixed bottom-20 right-6 z-[1100] hidden w-80 flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card md:flex',
            'shadow-[var(--shadow-floating)]',
          )}
          style={{ height: '480px' }}
          role="dialog"
          aria-label="Chat con CritiComida"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle px-4 py-3">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faComments} aria-hidden className="text-action-primary" />
              <span className="font-display text-base font-medium text-text-primary">
                Asistente CritiComida
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors',
                'hover:bg-surface-card hover:text-text-primary',
                'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
              )}
              aria-label="Cerrar chat"
            >
              <FontAwesomeIcon icon={faXmark} aria-hidden />
            </button>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 font-sans text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-action-primary text-text-inverse'
                      : 'rounded-bl-sm bg-surface-subtle text-text-primary',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border-subtle p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Preguntá lo que quieras…"
                rows={1}
                className={cn(
                  'flex-1 resize-none rounded-md border border-border-default bg-surface-card px-3 py-2 font-sans text-sm text-text-primary',
                  'placeholder:text-text-muted',
                  'focus:outline-none focus:[box-shadow:var(--focus-ring)]',
                  'disabled:opacity-60',
                )}
                style={{ minHeight: '38px', maxHeight: '96px' }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  'bg-action-primary text-text-inverse transition-colors',
                  'hover:bg-action-primary-hover',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
                )}
                aria-label="Enviar mensaje"
              >
                <FontAwesomeIcon icon={faPaperPlane} aria-hidden className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-[1100] hidden h-14 w-14 items-center justify-center rounded-full md:flex',
          'bg-action-primary text-text-inverse shadow-[var(--shadow-elevated)]',
          'transition-transform hover:scale-105 active:scale-95',
          'focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]',
        )}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faComments} aria-hidden className="h-5 w-5" />
      </button>
    </>
  );
}
