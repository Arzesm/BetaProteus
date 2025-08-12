"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Message } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatInterface({ messages, setMessages }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: newMessages.slice(-10) }, // Отправляем последние 10 сообщений для контекста
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error("Ошибка при вызове функции чата:", error);
      let errorDescription = error.message;

      if (error instanceof FunctionsHttpError) {
        try {
          const errorJson = await error.context.json();
          if (errorJson.error) {
            errorDescription = errorJson.error;
          }
        } catch {
          // Ignore if the error response is not JSON
        }
      }
      
      toast.error("Не удалось получить ответ от Протея.", { description: errorDescription });
      const assistantErrorMessage: Message = { role: 'assistant', content: `Произошла ошибка: ${errorDescription}` };
      setMessages(prev => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-8 w-8 mx-2 mt-1">
                  {msg.role === 'user' ? (
                    <AvatarFallback>Вы</AvatarFallback>
                  ) : (
                    <AvatarImage src="https://i.postimg.cc/vHrZz2G8/image.png" />
                  )}
                </Avatar>
                <div className={`px-4 py-2 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] items-start">
                <Avatar className="h-8 w-8 mx-2 mt-1">
                  <AvatarImage src="https://i.postimg.cc/vHrZz2G8/image.png" />
                </Avatar>
                <div className="px-4 py-2 rounded-lg bg-accent text-accent-foreground">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Напишите сообщение..."
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? '...' : 'Отправить'}
          </Button>
        </div>
      </form>
    </div>
  );
}