import { NavLink } from "react-router-dom";
import { Home, User, Star, Moon, Brain, Book, HeartPulse, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", label: "Главный экран", icon: Home },
  { to: "/personality", label: "Анализ личности", icon: User },
  { to: "/astrology", label: "Астрология", icon: Star },
  { to: "/dreams", label: "Сны", icon: Moon },
  { to: "/psychology", label: "Психология", icon: Brain },
  { to: "/journal", label: "Дневник жизни", icon: Book },
  { to: "/health", label: "Здоровье", icon: HeartPulse },
  { to: "/chat", label: "Чат с Протеем", icon: MessageSquare },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="flex flex-col w-64 bg-card border-r h-full">
      <div className="px-4 border-b h-16 flex items-center justify-between">
        <Logo />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center px-3 py-2 text-card-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )
            }
          >
            <motion.span
              className="flex items-center w-full"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </motion.span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}