import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

interface Song {
  id: number;
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  lyrics: string;
  chords: string | null;
}

export default function LivePage() {
  const { id } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [chordSize, setChordSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [editMode, setEditMode] = useState(false);
  const [editedChords, setEditedChords] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const sizes: ('text-sm' | 'text-base' | 'text-lg')[] = ['text-sm', 'text-base', 'text-lg'];
  const currentIndex = sizes.indexOf(chordSize);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const endpoint = id && id !== '0'
          ? `${import.meta.env.VITE_API_URL}/api/songs/${id}`
          : `${import.meta.env.VITE_API_URL}/api/songs/current`;

        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        setSong(data);
        if (data.chords) {
          setEditedChords(JSON.stringify(JSON.parse(data.chords), null, 2));
        }
      } catch (error) {
        console.error('Error searching song:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  useEffect(() => {
    const handleSongSelected = (data: Song) => {
      setSong(data);
      setEditedChords(data.chords ? JSON.stringify(JSON.parse(data.chords), null, 2) : '');
    };

    socket.on('song-selected', handleSongSelected);
    return () => {
      socket.off('song-selected', handleSongSelected);
    };
  }, []);

  const handleSaveChords = async () => {
    try {
      const parsed = JSON.parse(editedChords);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/songs/${id || song?.id}/chords`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chords: parsed }),
      });
      if (res.ok) {
        alert('Chords saved!');
        setEditMode(false);
        setSong({ ...song!, chords: JSON.stringify(parsed) });
      } else {
        throw new Error('Error saving chords');
      }
    } catch {
      alert('Error: JSON inválido');
    }
  };

  if (loading) {
    return <div className="p-4 text-white text-xl text-center">🔄 loading song...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1f2c38] text-white p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-start gap-2">
        {song && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setChordSize(sizes[Math.max(0, currentIndex - 1)])}
              className="text-xs bg-gray-600 px-2 py-1 rounded"
            >
              A-
            </button>
            <button
              onClick={() => setChordSize(sizes[Math.min(sizes.length - 1, currentIndex + 1)])}
              className="text-xs bg-gray-600 px-2 py-1 rounded"
            >
              A+
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => setEditMode(!editMode)} className="text-xs bg-green-700 px-2 py-1 rounded">
                {editMode ? 'Visualizar' : 'Editar'}
              </button>
            )}
          </div>
        )}
      </div>

      {!song ? (
        <div className="text-center text-gray-300">No song loaded</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-[#9F453A]">{song.trackName}</h1>
          <p className="text-sm text-gray-300 mb-4">by {song.artistName}</p>
          <img
            src={song.artworkUrl100}
            alt={song.trackName}
            className="w-40 h-40 mb-4 rounded-lg"
          />

          {song.previewUrl && (
            <audio controls loop className="mb-6 w-full max-w-sm">
              <source src={song.previewUrl} type="audio/mpeg" />
            </audio>
          )}

          {editMode ? (
            <div className="mb-6">
              <textarea
                value={editedChords}
                onChange={(e) => setEditedChords(e.target.value)}
                className="w-full h-64 bg-[#2b3e4f] p-4 text-sm text-white font-mono rounded"
              />
              <button onClick={handleSaveChords} className="mt-2 px-4 py-2 bg-[#9F453A] rounded hover:bg-[#b85547]">
                Save Chords
              </button>
            </div>
          ) : song.chords ? (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-[#9F453A] mb-2">Chords</h2>
              <div className="space-y-4 font-mono">
                {JSON.parse(song.chords).map((line: any[], index: number) => (
                  <div key={index} className="flex flex-wrap justify-start gap-4">
                    {line.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center min-w-[40px] px-1">
                        <span className={`text-green-300 text-center ${chordSize}`}>
                          {item.chords || ''}
                        </span>
                        <span className={`text-white text-center ${chordSize}`}>
                          {item.lyrics}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : song.lyrics ? (
            <div>
              <h2 className="text-lg font-bold text-[#9F453A] mb-2">Lyrics</h2>
              <pre className={`whitespace-pre-wrap ${chordSize} text-gray-100`}>{song.lyrics}</pre>

            </div>
          ) : (
            <div className="text-sm text-gray-400 italic mt-4">
              Lyrics or chords not found. Admin can add it in Search page.
            </div>
          )}
        </>
      )}
    </div>
  );
}
