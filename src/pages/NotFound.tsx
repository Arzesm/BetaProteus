import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { pageAnimation } from "@/lib/animations";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Ой! Страница не найдена</p>
        <a href="/" className="text-primary hover:underline">
          Вернуться на главную
        </a>
      </div>
    </motion.div>
  );
};

export default NotFound;