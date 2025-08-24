import { Home, User, Star, Moon, Brain, Book, Sparkles, MessageSquare } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const navItems: NavItem[] = [
  { to: "/", label: "Главный экран", icon: Home },
  { to: "/personality", label: "Анализ личности", icon: User },
  { to: "/astrology", label: "Астрология", icon: Star },
  { to: "/dreams", label: "Сны", icon: Moon },
  { to: "/psychology", label: "Психология", icon: Brain },
  { to: "/journal", label: "Дневник жизни", icon: Book },
  { to: "/meditation", label: "Медитации", icon: Sparkles },
  { to: "/chat", label: "Чат с Протеем", icon: MessageSquare },
];


