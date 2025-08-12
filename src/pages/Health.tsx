import { motion } from "framer-motion";
import { pageAnimation } from "@/lib/animations";

const Health = () => {
  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold">Здоровье</h1>
      <p className="text-muted-foreground mt-2">
        Здесь будет отображаться синхронизированная информация о вашем здоровье.
      </p>
    </motion.div>
  );
};

export default Health;