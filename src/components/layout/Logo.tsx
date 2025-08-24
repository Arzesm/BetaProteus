import { Link } from 'react-router-dom';

export const Logo = () => (
  <Link to="/">
    <img 
      src="https://i.postimg.cc/Pq43L4NS/IMG-1958.png" 
      alt="Логотип Протей" 
      className="h-12 w-auto hover:opacity-80 transition-opacity"
    />
  </Link>
);