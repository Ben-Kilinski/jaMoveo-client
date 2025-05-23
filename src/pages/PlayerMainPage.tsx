import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

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
  const [chordSize, setChordSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const [viewMode, setViewMode] = useState<'all' | 'lyrics' | 'chords'>('all');
  const [editMode, setEditMode] = useState(false);
  const [editedChords, setEditedChords] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [audioKey, setAudioKey] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
        setAudioKey(prev => prev + 1);
        if (data.chords) {
          setEditedChords(JSON.stringify(JSON.parse(data.chords), null, 2));
        }
      } catch (error) {
        console.error('Erro ao buscar a música:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(err => console.log('Erro ao dar play automático:', err));
    }
  }, [song?.previewUrl]);

  const handleSearch = async () => {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=music&limit=1`);
      const data = await res.json();
      const song = data.results[0];
      if (!song) return alert('Nenhuma música encontrada');

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
      setAudioKey(prev => prev + 1);
    } catch (error) {
      console.error('Erro na busca:', error);
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
        alert('Cifras salvas!');
        setEditMode(false);
        setSong({ ...song!, chords: JSON.stringify(parsed) });
      } else {
        throw new Error('Erro ao salvar cifras');
      }
    } catch {
      alert('Erro: JSON inválido');
    }
  };

  if (loading) {
    return <div className="p-4 text-white text-xl text-center">🔄 loading song...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1f2c38] text-white p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search song on iTunes"
            className="bg-[#2b3e4f] border border-gray-600 p-2 rounded text-white placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            className="bg-[#9F453A] px-4 py-2 rounded hover:bg-[#b85547] text-sm"
          >Search</button>
        </div>
        {song && (
          <div className="flex gap-2">
            <button
              onClick={() => setChordSize(sizes[Math.max(0, currentIndex - 1)])}
              className="text-xs bg-gray-600 px-2 py-1 rounded"
            >A-</button>
            <button
              onClick={() => setChordSize(sizes[Math.min(sizes.length - 1, currentIndex + 1)])}
              className="text-xs bg-gray-600 px-2 py-1 rounded"
            >A+</button>
            <button
              onClick={() =>
                setViewMode(viewMode === 'all' ? 'lyrics' : viewMode === 'lyrics' ? 'chords' : 'all')
              }
              className="text-xs bg-blue-600 px-2 py-1 rounded"
            >
              {viewMode === 'all' ? 'lyrics' : viewMode === 'lyrics' ? 'Cifras' : 'Tudo'}
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => setEditMode(!editMode)} className="text-xs bg-green-700 px-2 py-1 rounded">
                {editMode ? 'View' : 'Edit'}
              </button>
            )}
          </div>
        )}
      </div>

      {!song ? (
        <div className="text-center text-gray-300">Nenhuma música carregada</div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-[#9F453A]">{song.trackName}</h1>
          <p className="text-sm text-gray-300 mb-4">by {song.artistName}</p>
          <img src={song.artworkUrl100} alt={song.trackName} className="w-40 h-40 mb-4 rounded-lg" />

          {song.previewUrl && (
            <audio
              key={`${audioKey}-${song.previewUrl}`}
              ref={audioRef}
              controls
              autoPlay
              loop
              className="mb-6"
            >
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
                Salvar Cifras
              </button>
            </div>
          ) : (
            <>
              {song.chords && viewMode !== 'lyrics' && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-[#9F453A] mb-2">Cifras</h2>
                  <div className={`space-y-4 font-mono ${chordSize}`}>
                    {JSON.parse(song.chords).map((line: any[], index: number) => (
                      <div key={index}>
                        <div className="text-green-300 text-left break-words whitespace-pre-wrap">
                          {line.map(item => item.chords || '').join(' ')}
                        </div>
                        <div className="text-white text-left break-words whitespace-pre-wrap">
                          {line.map(item => item.lyrics || '').join(' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {song.lyrics && viewMode !== 'chords' && (
                <div>
                  <h2 className="text-lg font-bold text-[#9F453A] mb-2">Letra</h2>
                  <pre className={`whitespace-pre-wrap ${chordSize} text-gray-100`}>
                    {song.lyrics}
                  </pre>
                </div>
              )}
            </>
          )}
          {!song.lyrics && !song.chords && (
            <div className="text-sm text-gray-400 italic mt-4">
              Lyrics or chords not found. Admin can add it in Search page.
            </div>
          )}

        </>
      )}


    </div>
  );
}
