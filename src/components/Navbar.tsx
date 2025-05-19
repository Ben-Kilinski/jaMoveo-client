import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-[#1f2c38] text-white px-6 py-4 shadow-md flex justify-between items-center fixed top-0 w-full z-50">
      <div className="text-xl font-bold text-[#9F453A]">🎵 jaMoveo</div>

      <ul className="flex gap-6 text-sm font-medium">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/admin/results">Histórico</Link></li>
        <li><Link to="/player/1">Player</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/signup">Signup</Link></li>
      </ul>
    </nav>
  );
}
