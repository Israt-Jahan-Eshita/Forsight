import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hello! I am EduLens Assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'I am your guide! To take a quiz, click on "My Quizzes" in the left menu, then click "Start Quiz".',
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100]">
        <Button
          variant="primary"
          className="w-14 h-14 rounded-full shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)] flex items-center justify-center p-0 transition-transform hover:scale-105 active:scale-95 animate-pulse-soft"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </Button>
      </div>

      <div
        className={cn(
          'fixed bottom-24 right-6 z-[100] w-80 sm:w-96 transition-all duration-300 origin-bottom-right',
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <Card className="p-0 overflow-hidden flex flex-col h-[500px] border border-white/50 shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)] bg-color-background">
          {/* Header */}
          <div className="p-4 bg-color-surface border-b border-black/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-color-accent flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-color-text font-serif">Forsight Assistant</h3>
              <p className="text-xs text-color-muted">I can help you navigate</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-color-background">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-3 max-w-[85%]', msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start')}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1',
                    msg.sender === 'user' ? 'bg-color-text text-white' : 'bg-white text-color-text neu-raised shadow-sm'
                  )}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={cn(
                    'p-3 rounded-2xl text-sm leading-relaxed shadow-sm',
                    msg.sender === 'user'
                      ? 'bg-color-text text-white rounded-tr-sm'
                      : 'bg-color-surface text-color-text neu-raised rounded-tl-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="self-start flex gap-3 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-white text-color-text neu-raised shadow-sm flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 bg-color-surface neu-raised rounded-2xl rounded-tl-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-color-muted rounded-full animate-pulse-soft"></div>
                  <div className="w-1.5 h-1.5 bg-color-muted rounded-full animate-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-color-muted rounded-full animate-pulse-soft" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-color-surface border-t border-black/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 neu-inset bg-color-background px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                type="submit"
                variant="primary"
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
}
