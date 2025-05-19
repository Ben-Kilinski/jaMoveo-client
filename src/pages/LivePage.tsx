import { useEffect, useState } from 'react';
import { Music, Drum, Guitar, Mic2, Piano } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  lyrics?: string;
  chords?: string;
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

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const instrument = user?.instrument || 'unknown';
  const Icon = iconMap[instrument] || Music;
  const instruction = instructionMap[instrument];

  useEffect(() => {
    if (!user || !user.instrument) {
      navigate('/onboarding');
    }
  }, []);

  useEffect(() => {
    const handleSong = (song: Song) => {
      console.log('🎶 Recebido via socket:', song);
      setSong(song);
      setAudioKey(prev => prev + 1);
    };

    console.log('🛜 Registrando socket listener');
    socket.on('song-selected', handleSong);

    return () => {
      console.log('❌ Removendo socket listener');
      socket.off('song-selected', handleSong);
    };
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
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#355167] text-white text-center relative mt-14">
      <div className="absolute top-4 right-6">
        <button
          onClick={handleLogout}
          className="text-sm text-red-400 underline hover:text-red-600"
        >
          Logout
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-[#9F453A]">Now Playing</h1>

      {!song ? (
        <>
          <p className="mb-6 text-red-300">No song selected</p>
          <button
            onClick={selectExampleSong}
            className="animate-pulse bg-[#9F453A] text-white px-6 py-3 rounded-xl shadow hover:bg-[#b85547] transition"
          >
            Load Example Song
          </button>
        </>
      ) : (
        <>
          <img
            src={song.artworkUrl100}
            alt={song.trackName}
            className="mx-auto mb-6 w-24 h-24 rounded-lg shadow hover:scale-105 transition"
          />
          <h2 className="text-2xl font-bold mb-1">{song.trackName}</h2>
          <p className="text-gray-300 mb-4">{song.artistName}</p>

          {song.previewUrl && (
            <audio key={audioKey} controls autoPlay className="mx-auto mb-6">
              <source src={song.previewUrl} type="audio/mpeg" />
            </audio>
          )}

          <div className="max-w-md mx-auto mt-6 p-4 border border-[#9F453A] bg-[#1f2c38] rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2 text-[#9F453A]">
              <Icon className="w-5 h-5" /> Instructions for: {instrument}
            </h3>
            <p className="text-sm text-gray-200 leading-relaxed">{instruction}</p>
          </div>

          {song.lyrics && (
            <div className="mt-6 p-4 border border-[#9F453A] rounded shadow bg-[#1f2c38] text-left max-w-2xl mx-auto">
              <h4 className="text-lg font-bold mb-2 text-[#9F453A]">Lyrics</h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-100">{song.lyrics}</pre>
            </div>
          )}

          {song.chords && instrument !== 'vocals' && (
            <div className="mt-6 p-4 border border-[#9F453A] rounded shadow bg-[#1f2c38] max-w-2xl mx-auto">
              <h4 className="text-lg font-bold mb-4 text-center text-[#9F453A]">Chords</h4>
              <div className="space-y-4 text-left font-mono text-sm">
                {JSON.parse(song.chords).map((line: any[], lineIdx: number) => (
                  <div key={lineIdx}>
                    <div className="flex gap-2 justify-center">
                      {line.map((item, idx) => (
                        <span key={idx} className="min-w-[50px] text-green-300 text-center">
                          {item.chords || ''}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 justify-center">
                      {line.map((item, idx) => (
                        <span key={idx} className="min-w-[50px] text-gray-100 text-center">
                          {item.lyrics}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
