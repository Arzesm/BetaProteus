import { Logo } from "./Logo";

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between px-4 h-16 border-b">
      <Logo />
      {/* Кнопка меню и другие элементы */}
    </header>
  );
}