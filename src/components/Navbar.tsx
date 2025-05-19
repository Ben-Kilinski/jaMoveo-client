import { Link } from 'react-router-dom';
import animation from '../assets/Animation-chord2.json';
import Lottie from 'lottie-react';
import moveoLogo from '../assets/jaLogo-cut.png';

export default function Navbar() {

  return (
    <nav className="bg-[#1f2c38] text-white px-4 py-3 shadow-md flex justify-between items-center fixed top-0 w-full z-50">
      <div className="flex items-center gap-0">
        <img src={moveoLogo} alt="Moveo Logo" className="w-32 h-16 object-contain" />
        <Lottie
          animationData={animation}
          loop
          autoplay
          className="w-16 h-16"
        />
      </div>

      <ul className="flex gap-6 text-base font-semibold">
        <li>
          <Link
            to="/live"
            title="Live page with current song, instructions and lyrics"
            className="hover:text-[#9F453A] transition"
          >Live</Link>
        </li>
        <li>
          <Link
            to="/admin"
            title="Search and select songs to share with users"
            className="hover:text-[#9F453A] transition"
          >Search</Link>
        </li>
        <li>
          <Link
            to="/admin/results"
            title="Browse the full history of selected songs"
            className="hover:text-[#9F453A] transition"
          >History</Link>
        </li>
        <li>
          <Link
            to="/player/0"
            title="Advanced viewer with lyrics, chords and editing tools"
            className="hover:text-[#9F453A] transition"
          >Player</Link>
        </li>
        <li>
          <Link
            to="/login"
            title="Access your musician or admin account"
            className="hover:text-[#9F453A] transition"
          >Login</Link>
        </li>
        <li>
          <Link
            to="/signup"
            title="Create your account and select your instrument"
            className="hover:text-[#9F453A] transition"
          >Signup</Link>
        </li>
      </ul>
    </nav>

  );

}
