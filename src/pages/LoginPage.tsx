import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
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
  <div className="min-h-screen flex flex-col justify-center items-center bg-[#355167] text-white px-4">
    <div className="w-full max-w-md bg-[#1f2c38] p-8 rounded-2xl shadow-xl border border-[#9F453A]">
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
);


}
