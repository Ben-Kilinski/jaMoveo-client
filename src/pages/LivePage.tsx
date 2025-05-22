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

export default function PlayerMainPage() {
  const { id } = useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [chordSize, setChordSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-sm');
  const [editMode, setEditMode] = useState(false);
  const [editedChords, setEditedChords] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
      console.log('📡 Updating song by socked:', data);
      setSong(data);
      setEditedChords(data.chords ? JSON.stringify(JSON.parse(data.chords), null, 2) : '');
    };

    socket.on('song-selected', handleSongSelected);
    return () => {
      socket.off('song-selected', handleSongSelected);
    };
  }, []);

  const handleSearch = async () => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&limit=1`);
      const data = await res.json();
      const song = data.results[0];
      if (!song) return alert('No song found');

      const payload = {
        trackId: song.trackId,
        trackName: song.trackName,
        artistName: song.artistName,
        artworkUrl100: song.artworkUrl100,
        previewUrl: song.previewUrl,
      };

      const saveRes = await fetch(`${import.meta.env.VITE_API_URL}/api/songs/current`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const savedSong = await saveRes.json();
      setSong({ ...payload, id: savedSong.id, lyrics: savedSong.lyrics, chords: savedSong.chords });
    } catch (error) {
      console.error('Error on search:', error);
    }
  };

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
    return <div className="p-4 text-white text-xl text-center">🔄 Carregando música...</div>;
  }

  return (
  <div className="min-h-screen bg-[#1f2c38] text-white p-6 mt-20">
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar música no iTunes"
          className="bg-[#2b3e4f] border border-gray-600 p-2 rounded text-white placeholder-gray-400"
        />
        <button
          onClick={handleSearch}
          className="bg-[#9F453A] px-4 py-2 rounded hover:bg-[#b85547] text-sm"
        >Buscar</button>
      </div>
      {song && (
        <div className="flex gap-2">
          <button onClick={() => setChordSize('text-sm')} className="text-xs bg-gray-600 px-2 py-1 rounded">A-</button>
          <button onClick={() => setChordSize('text-lg')} className="text-xs bg-gray-600 px-2 py-1 rounded">A+</button>
        </div>
      )}
    </div>

    {!song ? (
      <div className="text-center text-gray-300">No song loaded</div>
    ) : (
      <>
        <h1 className="text-2xl font-bold text-[#9F453A]">{song.trackName}</h1>
        <p className="text-sm text-gray-300 mb-4">by {song.artistName}</p>
        <img src={song.artworkUrl100} alt={song.trackName} className="w-40 h-40 mb-4 rounded-lg" />

        {song.previewUrl && (
          <audio controls loop className="mb-6">
            <source src={song.previewUrl} type="audio/mpeg" />
          </audio>
        )}

        {(song.chords && user?.role !== 'singer') ? (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#9F453A] mb-2">Chords</h2>
            <div className="space-y-4 font-mono">
              {(() => {
                try {
                  const chordsArray = JSON.parse(song.chords);
                  return chordsArray.map((line: any[], index: number) => (
                    <div key={index} className="flex gap-2 justify-center">
                      {line.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center min-w-[50px]">
                          <span className={`text-green-300 text-center ${chordSize}`}>
                            {item.chords || ''}
                          </span>
                          <span className={`text-white text-center ${chordSize}`}>
                            {item.lyrics}
                          </span>
                        </div>
                      ))}
                    </div>
                  ));
                } catch {
                  return <p className="text-red-400">Erro ao carregar cifras</p>;
                }
              })()}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-[#9F453A] mb-2">Lyrics</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-100">{song.lyrics}</pre>
          </div>
        )}
      </>
    )}
  </div>
);


}
