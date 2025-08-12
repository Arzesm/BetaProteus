import { NavLink } from "react-router-dom";
import { Home, User, Star, Moon, Brain, Book, HeartPulse, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { navItems } from "./navItems";

// navItems теперь импортируется из единого источника

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r">
      <div className="px-4 border-b h-16 flex items-center">
        <Logo />
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
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