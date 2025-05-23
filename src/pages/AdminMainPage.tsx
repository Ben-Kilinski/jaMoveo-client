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
  const [latestSong, setLatestSong] = useState<{ id: number; trackName: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrent = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/songs/current`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/songs/current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(song),
      });

      if (!res.ok) {
        const error = await res.json();
        alert('Failed to select song: ' + error.message);
        return;
      }

      const data = await res.json(); // 🎯 música salva com ID do banco
      setCurrentDbId(data.id);

      // ✅ Emitir evento para todos os sockets conectados
      console.log('📡 Emitindo via socket:', data);
      socket.emit('song-selected', data);

      alert('Song selected 🎶');
      navigate(`/player/${data.id}`);
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-[#355167] text-white p-6 pt-12">
      <h1 className="text-2xl font-bold mb-6 text-[#9F453A] text-center">Search any song...</h1>

      {latestSong && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#1f2c38] border border-[#9F453A] p-4 rounded-xl shadow">
          <p className="text-sm text-white">
            Last selected song: <strong>{latestSong.trackName}</strong>
          </p>
          <div className="mt-3 sm:mt-0 flex gap-2">
            <button
              onClick={() => navigate(`/admin/chords-editor/${latestSong.id}`)}
              className="bg-[#9F453A] text-white px-4 py-2 rounded hover:bg-[#b85547] transition"
            >
              Edit chords
            </button>

            <button
              onClick={() => navigate(`/player/${latestSong.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Go to Player
            </button>
          </div>
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
