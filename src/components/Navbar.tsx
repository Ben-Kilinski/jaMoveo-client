import { Link } from 'react-router-dom';
import animation from '../assets/Animation-chord2.json';
import Lottie from 'lottie-react';

export default function Navbar() {
 return (
  <nav className="bg-[#1f2c38] text-white px-2 py-2 shadow-md flex justify-between items-center fixed top-0 w-full z-50">

    <div className="flex items-center">
      <Lottie
        animationData={animation}
        loop
        autoplay
        className="w-14 h-14" // reduzido para caber na altura da navbar
      />
      <span className="text-xl font-bold text-[#9F453A]">jaMoveo</span>
    </div>

    {/* Links de navegação */}
    <ul className="flex gap-6 text-sm font-medium">
      <li><Link to="/live">Live</Link></li>
      <li><Link to="/admin">Search</Link></li>
      <li><Link to="/admin/results">Histórico</Link></li>
      <li><Link to="/player/0">Player</Link></li>
      <li><Link to="/login">Login</Link></li>
      <li><Link to="/signup">Signup</Link></li>
    </ul>
  </nav>
);

}
