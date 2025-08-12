import { Outlet, useOutletContext } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Sidebar */}
      <motion.div 
        className="md:hidden fixed left-0 top-0 h-full w-64 bg-card border-r z-50"
        initial={{ x: -256 }}
        animate={{ x: isMobileMenuOpen ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(e, info) => {
          if (info.offset.x < -100) {
            setIsMobileMenuOpen(false);
          }
        }}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </motion.div>
      
      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col"
        animate={{ 
          x: isMobileMenuOpen ? 64 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 h-16 border-b bg-background">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            aria-label="Открыть меню"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 flex justify-center">
            <Logo />
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet context={{ messages, setMessages }} />
        </main>
      </motion.div>
      
      <Toaster />
    </div>
  );
}