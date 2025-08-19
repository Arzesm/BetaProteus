import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { navItems } from "./navItems";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Кнопка-гамбургер */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="h-10 w-10 p-0 bg-background/80 backdrop-blur-sm border-border/60"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Скрывающаяся боковая панель */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Затемнение фона */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleSidebar}
            />
            
            {/* Боковая панель */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full w-80 bg-card border-r z-50 md:hidden"
            >
              <div className="px-4 border-b h-16 flex items-center justify-between">
                <Logo />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
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
                    onClick={toggleSidebar}
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
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
