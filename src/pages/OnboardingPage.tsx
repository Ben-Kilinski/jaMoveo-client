import { useEffect, useState } from 'react';
import { Music, Drum, Guitar, Mic2, Piano } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
}

const iconMap: Record<string, LucideIcon> = {
  drums: Drum,
  guitar: Guitar,
  bass: Guitar,
  vocals: Mic2,
  keyboards: Piano,
  saxophone: Music,
  unknown: Music,
};

const instructionMap: Record<string, string> = {
  drums: 'Keep the tempo steady, focus on rhythm.',
  guitar: 'Play chord progression in G major.',
  bass: 'Follow root notes and lock with kick drum.',
  saxophone: 'Improvise over the chorus using G pentatonic.',
  keyboards: 'Use ambient pads and soft chords in intro.',
  vocals: 'Sing the main melody, follow the lyrics on sheet.',
  unknown: 'No instrument assigned.',
};

export default function LivePage() {
  const [song, setSong] = useState<Song | null>(null);
  const [audioKey, setAudioKey] = useState(0);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const instrument = user.instrument || 'unknown';

  useEffect(() => {
    if (!user.instrument) {
      navigate('/onboarding');
      return;
    }
  }, []);

  const Icon = iconMap[instrument] || Music;
  const instruction = instructionMap[instrument];

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3002');

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'update') {
        setSong(message.song);
        setAudioKey(prev => prev + 1);
      }
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    return () => socket.close();
  }, []);

  const selectExampleSong = async () => {
    const res = await fetch('https://itunes.apple.com/search?term=beatles&media=music&limit=1');
    const data = await res.json();
    const song = data.results[0];

    const payload = {
      trackId: song.trackId,
      trackName: song.trackName,
      artistName: song.artistName,
      artworkUrl100: song.artworkUrl100,
      previewUrl: song.previewUrl,
    };

    await fetch(`${import.meta.env.VITE_API_URL}/api/songs/current`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="p-4 text-center">
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 underline hover:text-red-800"
        >
          Logout
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Now Playing</h1>
      {!song ? (
        <>
          <p className="mb-4 text-red-500">No song selected</p>
          <button
            onClick={selectExampleSong}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Load Example Song
          </button>
        </>
      ) : (
        <>
          <img src={song.artworkUrl100} alt={song.trackName} className="mx-auto rounded mb-4" />
          <h2 className="text-xl font-semibold">{song.trackName}</h2>
          <p className="text-gray-600 mb-4">{song.artistName}</p>
          {song.previewUrl && (
            <audio key={audioKey} controls autoPlay className="mx-auto">
              <source src={song.previewUrl} type="audio/mpeg" />
            </audio>
          )}

          <div className="mt-6 p-4 border rounded shadow bg-gray-50">
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
              <Icon className="w-5 h-5" /> Instructions for: {instrument}
            </h3>
            <p className="text-sm text-gray-700">{instruction}</p>
          </div>
        </>
      )}
    </div>
  );
}
