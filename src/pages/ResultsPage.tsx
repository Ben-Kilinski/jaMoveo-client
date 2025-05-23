import { useEffect, useState } from 'react';

interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  timestamp: number;
}

export default function ResultsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const clearHistory = async () => {
    const confirm = window.confirm('Are you sure you want to clear the history?');
    if (!confirm) return;
    await fetch(`${import.meta.env.VITE_API_URL}/api/songs/history`, { method: 'DELETE' });
    setSongs([]);
  };

  const exportCSV = () => {
    const headers = ['Track Name', 'Artist', 'Date'];
    const rows = songs.map(song => [
      song.trackName,
      song.artistName,
      new Date(song.timestamp).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'song-history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/songs/history`);
        const data = await res.json();
        setSongs(data);
      } catch (err) {
        console.error(err);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <div className="p-4">Loading history...</div>;
  if (!songs.length) return <div className="p-4 text-gray-600">No songs selected yet.</div>;

  if (loading) {
  return (
    <div className="min-h-screen bg-[#355167] text-white flex items-center justify-center p-6">
      Loading history...
    </div>
  );
}

if (!songs.length) {
  return (
    <div className="min-h-screen bg-[#355167] text-gray-300 flex items-center justify-center p-6">
      No songs selected yet.
    </div>
  );
}

return (
  <div className="min-h-screen bg-[#355167] text-white p-6">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
      <h1 className="text-2xl font-bold text-[#9F453A]">History Section</h1>
      <div className="flex gap-2">
        <button
          onClick={exportCSV}
          className="bg-[#9F453A] text-white px-4 py-2 rounded hover:bg-[#b85547] transition"
        >
          Export CSV
        </button>
        <button
          onClick={clearHistory}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Clear History
        </button>
      </div>
    </div>

    <ul className="space-y-4">
      {songs.map((song) => (
        <li
          key={song.trackId}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-[#9F453A] pb-4"
        >
          <img
            src={song.artworkUrl100}
            alt={song.trackName}
            className="w-16 h-16 rounded shadow"
          />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{song.trackName}</h2>
            <p className="text-sm text-gray-300">{song.artistName}</p>
            <p className="text-xs text-gray-400">
              {new Date(song.timestamp).toLocaleString()}
            </p>
          </div>
          {song.previewUrl && (
            <audio controls className="w-full sm:w-32">
              <source src={song.previewUrl} type="audio/mpeg" />
            </audio>
          )}
        </li>
      ))}
    </ul>
  </div>
);

}


