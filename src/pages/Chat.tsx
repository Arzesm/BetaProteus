import ChatInterface from '@/components/chat/ChatInterface';
import { useOutletContext } from 'react-router-dom';
import { ChatContextType } from '@/components/layout/Layout';
import { motion } from "framer-motion";
import { pageAnimation } from "@/lib/animations";

const Chat = () => {
  const { messages, setMessages } = useOutletContext<ChatContextType>();

  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="space-y-8 h-[calc(100vh-200px)]"
    >
      <div>
        <h1 className="text-3xl font-bold">Чат с Протеем</h1>
        <p className="text-muted-foreground mt-2">
          Задайте любой вопрос нашему ИИ-помощнику.
        </p>
      </div>
      <ChatInterface messages={messages} setMessages={setMessages} />
    </motion.div>
  );
};

export default Chat;