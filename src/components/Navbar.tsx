import { useState } from 'react';
import { Link } from 'react-router-dom';
import animation from '../assets/Animation-chord2.json';
import Lottie from 'lottie-react';
import moveoLogo from '../assets/jaLogo-cut.png';
import { Menu, X } from 'lucide-react'; // ícones

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1f2c38] text-white px-4 py-3 shadow-md fixed top-0 w-full z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={moveoLogo} alt="Moveo Logo" className="w-28 h-12 object-contain" />
          <Lottie animationData={animation} loop autoplay className="w-12 h-12" />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop menu */}
        <ul className="hidden md:flex gap-6 text-base font-semibold">
          {navLinks()}
        </ul>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <ul className="absolute right-4 mt-2 w-fit bg-[#1f2c38] p-4 rounded-md shadow-lg flex flex-col space-y-3 md:hidden text-base font-semibold z-50">
          {navLinks(true)}
        </ul>
      )}
    </nav>
  );

  function navLinks(closeOnClick = false) {
    const handleClick = () => {
      if (closeOnClick) setMenuOpen(false);
    };

    return (
      <>
        <li><Link to="/live" onClick={handleClick}>Live</Link></li>
        <li><Link to="/admin" onClick={handleClick}>Search</Link></li>
        <li><Link to="/admin/results" onClick={handleClick}>History</Link></li>
        <li><Link to="/player/0" onClick={handleClick}>Player</Link></li>
        <li><Link to="/login" onClick={handleClick}>Login</Link></li>
        <li><Link to="/signup" onClick={handleClick}>Signup</Link></li>
      </>
    );
  }
}
