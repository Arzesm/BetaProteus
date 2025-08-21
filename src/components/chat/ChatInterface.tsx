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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function ChatInterface({ messages, setMessages }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSending, setIsAutoSending] = useState(false);
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
      
      // Если ошибка связана с Edge Function, пробуем еще раз
      if (errorDescription.includes('Edge Function') || errorDescription.includes('Failed to send')) {
        console.log('ChatInterface: Edge Function error detected, retrying...');
        toast.info("Повторная попытка подключения к Протею...", { duration: 2000 });
        
        // Ждем 2 секунды перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const { data: retryData, error: retryError } = await supabase.functions.invoke('chat', {
            body: { messages: newMessages.slice(-10) },
          });

          if (retryError) {
            throw retryError;
          }

          const assistantMessage: Message = { role: 'assistant', content: retryData.reply };
          setMessages(prev => [...prev, assistantMessage]);
          return;
        } catch (retryError: any) {
          console.error("Ошибка при повторной попытке:", retryError);
          errorDescription = retryError.message;
        }
      }
      
      toast.error("Не удалось получить ответ от Протея.", { description: errorDescription });
      const assistantErrorMessage: Message = { role: 'assistant', content: `Произошла ошибка: ${errorDescription}` };
      setMessages(prev => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверяем localStorage для автоматической отправки сообщения с результатом теста
  useEffect(() => {
    const proteusChatMessage = localStorage.getItem('proteusChatMessage');
    const proteusChatSource = localStorage.getItem('proteusChatSource');
    const proteusChatTestId = localStorage.getItem('proteusChatTestId');
    
    console.log('ChatInterface: Checking localStorage for test results...');
    console.log('proteusChatMessage:', proteusChatMessage);
    console.log('proteusChatSource:', proteusChatSource);
    console.log('proteusChatTestId:', proteusChatTestId);
    
    if (proteusChatMessage && proteusChatSource && proteusChatTestId) {
      console.log('ChatInterface: Found test results, preparing to send...');
      
      // Показываем уведомление о том, что результат теста автоматически отправляется
      toast.success("Результат теста автоматически отправлен Протею!", {
        description: "Подождите немного, Протей подключается и анализирует ваши результаты..."
      });
      
      // Автоматически отправляем сообщение с результатом теста
      const userMessage: Message = { role: 'user', content: proteusChatMessage };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      
      console.log('ChatInterface: User message created:', userMessage);
      console.log('ChatInterface: New messages array:', newMessages);
      
      // Очищаем localStorage
      localStorage.removeItem('proteusChatMessage');
      localStorage.removeItem('proteusChatSource');
      localStorage.removeItem('proteusChatTestId');
      
      // Автоматически отправляем сообщение Протею с увеличенной задержкой для стабилизации
      setTimeout(() => {
        sendMessageToProteus(newMessages);
      }, 2000); // Задержка 2 секунды для полной стабилизации Edge Function
    } else {
      console.log('ChatInterface: No test results found in localStorage');
    }
  }, []); // Запускаем только при монтировании компонента

  // Функция для отправки сообщения Протею
  const sendMessageToProteus = async (messagesToSend: Message[]) => {
    console.log('ChatInterface: sendMessageToProteus called with messages:', messagesToSend);
    setIsAutoSending(true);
    setIsLoading(true);
    
    try {
      // Дополнительная задержка для стабилизации Edge Function
      console.log('ChatInterface: Waiting for Edge Function to stabilize...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('ChatInterface: Sending messages to Proteus:', messagesToSend.slice(-10));
      
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { messages: messagesToSend.slice(-10) }, // Отправляем последние 10 сообщений для контекста
      });

      if (error) {
        throw error;
      }

      console.log('ChatInterface: Received response from Proteus:', data);
      const assistantMessage: Message = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error("Ошибка при автоматической отправке сообщения:", error);
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
      
      // Если ошибка связана с Edge Function, пробуем еще раз
      if (errorDescription.includes('Edge Function') || errorDescription.includes('Failed to send')) {
        console.log('ChatInterface: Edge Function error in auto-send, retrying...');
        toast.info("Повторная попытка подключения к Протею...", { duration: 2000 });
        
        // Ждем 3 секунды перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const { data: retryData, error: retryError } = await supabase.functions.invoke('chat', {
            body: { messages: messagesToSend.slice(-10) },
          });

          if (retryError) {
            throw retryError;
          }

          const assistantMessage: Message = { role: 'assistant', content: retryData.reply };
          setMessages(prev => [...prev, assistantMessage]);
          return;
        } catch (retryError: any) {
          console.error("Ошибка при повторной попытке в auto-send:", retryError);
          errorDescription = retryError.message;
        }
      }
      
      toast.error("Не удалось получить ответ от Протея.", { description: errorDescription });
      const assistantErrorMessage: Message = { role: 'assistant', content: `Произошла ошибка: ${errorDescription}` };
      setMessages(prev => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
      setIsAutoSending(false);
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
                  {msg.role === 'assistant' ? (
                    <div className="chat-markdown">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Кастомизируем стили для Markdown элементов
                          h1: ({node, ...props}) => <h1 {...props} />,
                          h2: ({node, ...props}) => <h2 {...props} />,
                          h3: ({node, ...props}) => <h3 {...props} />,
                          p: ({node, ...props}) => <p {...props} />,
                          ul: ({node, ...props}) => <ul {...props} />,
                          ol: ({node, ...props}) => <ol {...props} />,
                          li: ({node, ...props}) => <li {...props} />,
                          strong: ({node, ...props}) => <strong {...props} />,
                          em: ({node, ...props}) => <em {...props} />,
                          code: ({node, ...props}) => <code {...props} />,
                          blockquote: ({node, ...props}) => <blockquote {...props} />,
                          hr: ({node, ...props}) => <hr {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
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
                  <div className="flex items-center space-x-2">
                    {isAutoSending && (
                      <span className="text-xs text-muted-foreground">
                        🤖 Протей подключается и анализирует результаты теста...
                      </span>
                    )}
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                    </div>
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