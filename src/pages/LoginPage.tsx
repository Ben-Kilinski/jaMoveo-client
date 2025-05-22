import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import animation from '../assets/Animation-dog.json';
import logo from '../assets/jaLogo-cut.png'; // substitua com o seu logo real
import Lottie from 'lottie-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('${import.meta.env.VITE_API_URL}/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/live');
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center bg-[#355167] text-white px-4 overflow-hidden">

      <div className="pt-6 flex flex-col items-center mb-6">
        <img
          src={logo}
          alt="Logo"
          className="w-52 h-auto sm:w-60"
        />
      </div>

      {/* Formulário centralizado verticalmente */}
      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md bg-[#1f2c38] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#9F453A]">
          <h1 className="text-2xl font-bold text-center mb-6 text-[#9F453A]">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full bg-[#2b3e4f] border border-gray-600 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9F453A]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-[#2b3e4f] border border-gray-600 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9F453A]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-[#9F453A] text-white font-semibold py-3 rounded hover:bg-[#b85547] transition-colors"
            >
              Login
            </button>
            {message && (
              <p className="mt-2 text-sm text-center text-red-400">{message}</p>
            )}
          </form>

          <p className="mt-6 text-sm text-center">
            First time here?{' '}
            <span
              onClick={() => navigate('/signup')}
              className="text-[#9F453A] hover:underline cursor-pointer font-semibold"
            >
              Signup
            </span>
          </p>
        </div>
      </div>

      <Lottie
        animationData={animation}
        loop
        autoplay
        className="w-44 h-auto scale-x-[-1] "
      />
    </div>
  );





}
