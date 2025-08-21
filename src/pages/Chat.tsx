import ChatInterface from '@/components/chat/ChatInterface';
import { useOutletContext } from 'react-router-dom';
import { ChatContextType } from '@/components/layout/Layout';
import { motion } from "framer-motion";
import { pageAnimation } from "@/lib/animations";

const Chat = () => {
  const { messages, setMessages } = useOutletContext<ChatContextType>();
  
  // Проверяем, пришел ли пользователь с результатом теста
  const hasTestResult = localStorage.getItem('proteusChatMessage') && 
                       localStorage.getItem('proteusChatSource') && 
                       localStorage.getItem('proteusChatTestId');

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
        
        {/* Уведомление о результате теста */}
        {hasTestResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Результат теста готов к обсуждению!</h3>
                <p className="text-blue-600 text-sm">
                  Протей автоматически получит ваши результаты и поможет их проанализировать.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <ChatInterface messages={messages} setMessages={setMessages} />
    </motion.div>
  );
};

export default Chat;