import { Outlet, useOutletContext } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect, useRef } from "react";

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type LayoutContextType = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export function Layout() {
  const [messages, setMessages] = useState<Message[]>([]);
  const isChatInitialMount = useRef(true);

  // Load chat history from localStorage on initial mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem('chatHistory');
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([{ role: 'assistant', content: 'Привет! Я Протей, ваш ИИ-помощник. Чем могу помочь?' }]);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
      setMessages([{ role: 'assistant', content: 'Привет! Я Протей, ваш ИИ-помощник. Чем могу помочь?' }]);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (isChatInitialMount.current) {
      isChatInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar - shown only on mobile */}
      <div className="md:hidden">
        <MobileSidebar />
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet context={{ messages, setMessages }} />
      </main>
      <Toaster />
    </div>
  );
}