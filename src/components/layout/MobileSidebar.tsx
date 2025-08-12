import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { navItems } from "./navItems";

export function MobileSidebar() {
  return (
    <aside className="flex flex-col w-16 bg-card border-r">
      <div className="px-2 border-b h-16 flex items-center justify-center">
        <Logo />
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-center px-2 py-3 text-card-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              )
            }
            title={item.label}
          >
            <motion.span
              className="flex items-center justify-center w-full"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <item.icon className="h-5 w-5" />
            </motion.span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
