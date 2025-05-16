import { useEffect, useState } from 'react';
import socket from '../socket'; // ajuste o caminho conforme a estrutura

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
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    // 🎧 Escuta o evento enviado pelo admin
    socket.on('song-selected', (data: Song) => {
      console.log('🎶 Música recebida via socket:', data);
      setSong(data);
    });

    return () => {
      socket.off('song-selected');
    };
  }, []);

  if (!song) {
    return <div className="p-4 text-white text-xl text-center">🎵 Waiting for next song...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1f2c38] text-white p-6">
      <h1 className="text-2xl font-bold text-center mb-4">{song.trackName}</h1>
      <h2 className="text-md text-center mb-6 text-gray-400">by {song.artistName}</h2>

      <div className="flex justify-center mb-4">
        <img
          src={song.artworkUrl100}
          alt={song.trackName}
          className="rounded-xl shadow-lg w-40 h-40 object-cover"
        />
      </div>

      <div className="bg-[#2b3e4f] p-6 rounded-xl max-w-3xl mx-auto whitespace-pre-wrap text-lg leading-relaxed">
        {/* Aqui renderiza só a letra ou letra + acordes baseado no usuário (ajustar isso se tiver role/instrumento) */}
        {song.chords ? (
          <>
            <p className="text-green-400 mb-2">🎸 Chords:</p>
            <pre className="text-white">{song.chords}</pre>
            <hr className="my-4 border-gray-600" />
          </>
        ) : null}

        <p className="text-white whitespace-pre-line">{song.lyrics}</p>
      </div>
    </div>
  );
}
