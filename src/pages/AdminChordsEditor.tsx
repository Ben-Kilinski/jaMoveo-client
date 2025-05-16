import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function AdminChordsEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chords, setChords] = useState('');
  const [message, setMessage] = useState('');
  const [trackName, setTrackName] = useState('');

  useEffect(() => {
    const fetchSong = async () => {
      const res = await fetch(`http://localhost:3001/api/songs/current`);
      const data = await res.json();
      if (data.id.toString() === id) {
        setTrackName(data.trackName);
        if (data.chords) {
          setChords(JSON.stringify(JSON.parse(data.chords), null, 2));
        }
      }
    };
    fetchSong();
  }, [id]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(chords);
      const res = await fetch(`http://localhost:3001/api/songs/${id}/chords`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chords: parsed }),
      });

      if (res.ok) {
        setMessage('✅ Chords saved!');
        setTimeout(() => navigate('/admin'), 1000);
      } else {
        throw new Error('Erro ao salvar cifra');
      }
    } catch (err) {
      setMessage('❌ JSON inválido ou erro na requisição');
    }
  };

  return (
  <div className="min-h-screen bg-[#355167] text-white p-6 flex flex-col items-center">
    <h1 className="text-2xl font-bold mb-4 text-[#9F453A]">
      Edit Chords for: {trackName}
    </h1>

    <textarea
      className="w-full max-w-2xl h-96 p-4 bg-[#1f2c38] border border-[#9F453A] rounded font-mono text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9F453A]"
      value={chords}
      onChange={(e) => setChords(e.target.value)}
      placeholder='Paste the chord JSON here (like in hey_jude.json)'
    />

    <button
      onClick={handleSave}
      className="mt-4 bg-[#9F453A] text-white px-6 py-2 rounded hover:bg-[#b85547] transition"
    >
      Save Chords
    </button>

    {message && (
      <p className="mt-4 text-sm text-center text-gray-300">{message}</p>
    )}
  </div>
);

}
