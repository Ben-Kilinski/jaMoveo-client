import { useState } from 'react';
import moveoLogo from '../assets/jamoveologo.png';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [instrument, setInstrument] = useState('guitar');
  const [role, setRole] = useState<'user' | 'admin' | ''>(''); // inicia vazio
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      setMessage('Please select a role before signing up.');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, instrument, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      setMessage('User created successfully ✅');
      // opcional: navigate('/login');
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#355167] text-white flex flex-col items-center justify-center px-4">
      <img src={moveoLogo} alt="Moveo Logo" className="w-32 h-auto mb-8" />

      <div className="bg-[#1f2c38] p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#9F453A]">
        <h1 className="text-2xl font-bold mb-6 text-center text-[#9F453A]">
          Signup
        </h1>

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
          <select
            className="w-full bg-[#2b3e4f] border border-gray-600 p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#9F453A]"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
          >
            <option value="guitar">Guitar</option>
            <option value="drums">Drums</option>
            <option value="bass">Bass</option>
            <option value="saxophone">Saxophone</option>
            <option value="keyboards">Keyboards</option>
            <option value="vocals">Vocals</option>
          </select>

          <select
            className="w-full bg-[#2b3e4f] border border-gray-600 p-3 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#9F453A]"
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin' | '')}
            required
          >
            <option value="" disabled>
              Select your role
            </option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-[#9F453A] text-white font-semibold py-3 rounded hover:bg-[#b85547] transition-colors"
          >
            Sign Up
          </button>

          {message && (
            <p className="mt-2 text-sm text-center text-red-400">{message}</p>
          )}
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-[#9F453A] hover:underline cursor-pointer font-semibold"
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}
