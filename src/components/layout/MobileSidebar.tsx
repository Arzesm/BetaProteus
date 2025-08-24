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
      {/* Мобильный заголовок с логотипом */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center">
            <Logo />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="h-10 w-10 p-0 border-border/60 hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Кнопка-гамбургер (скрыта, так как теперь в заголовке) */}
      <div className="hidden">
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
              className="fixed inset-0 top-16 bg-black/50 z-40 md:hidden"
              onClick={toggleSidebar}
            />
            
            {/* Боковая панель */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card border-r z-50 md:hidden"
            >
              <div className="px-4 border-b h-16 flex items-center justify-between">
                <div className="flex items-center">
                  <Logo />
                </div>
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
                        isActive && "bg-[#000126] text-white hover:bg-[#000126]/90 hover:text-white"
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
