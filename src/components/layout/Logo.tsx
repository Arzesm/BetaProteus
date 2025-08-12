import { Link } from 'react-router-dom';

export const Logo = () => (
  <Link to="/">
    <img 
      src="https://i.postimg.cc/vHrZz2G8/image.png" 
      alt="Логотип Протей" 
      className="h-12 w-auto hover:opacity-80 transition-opacity"
    />
  </Link>
);