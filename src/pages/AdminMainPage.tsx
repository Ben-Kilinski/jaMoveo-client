import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket'; // 👈 Ajuste o caminho conforme sua estrutura

interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
}

export default function AdminMainPage() {
  const [term, setTerm] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<number | null>(null);
  const [currentDbId, setCurrentDbId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [latestSong, setLatestSong] = useState<{ id: number; trackName: string } | null>(null);

  useEffect(() => {
    const fetchCurrent = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/current`);
      const data = await res.json();
      setLatestSong({ id: data.id, trackName: data.trackName });
    };
    fetchCurrent();
  }, []);

  const searchSongs = async () => {
    setLoading(true);
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=6`);
    const data = await res.json();
    setSongs(data.results);
    setLoading(false);
  };

  const handleSelect = async (song: Song) => {
    setSelectedSongId(song.trackId);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/songs/current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackId: song.trackId,
          trackName: song.trackName,
          artistName: song.artistName,
          artworkUrl100: song.artworkUrl100,
          previewUrl: song.previewUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert('Failed to select song: ' + error.message);
      } else {
        alert('Song selected 🎶');

        // buscar o id real no banco
        const current = await fetch(`${import.meta.env.VITE_API_URL}/songs/current`);
        const data = await current.json();
        setCurrentDbId(data.id);

        // 🔊 EMITIR EVENTO PARA TODOS OS USUÁRIOS
        socket.emit('song-selected', data); // envia a música completa para todos
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-[#355167] text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#9F453A] text-center">Search any song...</h1>

      {latestSong && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#1f2c38] border border-[#9F453A] p-4 rounded-xl shadow">
          <p className="text-sm text-white">
            Última música selecionada: <strong>{latestSong.trackName}</strong>
          </p>
          <button
            onClick={() => navigate(`/admin/chords-editor/${latestSong.id}`)}
            className="mt-3 sm:mt-0 bg-[#9F453A] text-white px-4 py-2 rounded hover:bg-[#b85547] transition"
          >
            Editar Cifras
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          className="w-full bg-[#2b3e4f] border border-gray-600 p-3 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9F453A]"
          placeholder="Search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button
          onClick={searchSongs}
          className="bg-[#9F453A] text-white px-4 py-2 rounded hover:bg-[#b85547] transition"
        >
          Search
        </button>
        <button
          onClick={() => navigate('/admin/results')}
          className="bg-[#1f2c38] text-white border border-white px-4 py-2 rounded hover:bg-[#2b3e4f] transition"
        >
          View History
        </button>
      </div>

      {loading && <p className="text-center text-gray-300">Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {songs.map((song) => (
          <div
            key={song.trackId}
            className="bg-[#1f2c38] border border-[#9F453A] rounded-xl p-4 shadow hover:shadow-lg transition flex flex-col items-center"
          >
            <img
              src={song.artworkUrl100}
              alt={song.trackName}
              className="mb-4 rounded-lg w-24 h-24 object-cover shadow-sm"
            />

            <h3 className="text-lg font-semibold text-center text-white">{song.trackName}</h3>
            <p className="text-sm text-gray-400 text-center mb-2">{song.artistName}</p>
            {song.previewUrl && (
              <audio controls className="w-full my-2">
                <source src={song.previewUrl} type="audio/mpeg" />
              </audio>
            )}
            <button
              onClick={() => handleSelect(song)}
              className={`mt-2 px-4 py-2 rounded text-white font-medium ${selectedSongId === song.trackId
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
                }`}
              disabled={selectedSongId === song.trackId}
            >
              {selectedSongId === song.trackId ? 'Selected' : 'Select'}
            </button>

            {selectedSongId === song.trackId && currentDbId && (
              <button
                onClick={() => navigate(`/admin/chords-editor/${currentDbId}`)}
                className="mt-3 px-4 py-2 rounded bg-[#9F453A] text-white hover:bg-[#b85547] transition"
              >
                Editar Cifras
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
