import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, deleteReport } from '../services/api';

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports().then(res => {
      setReports(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteReport(id);
    setReports(reports.filter(r => r._id !== id));
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white mb-6 text-sm transition">← Back</button>
        <h1 className="text-3xl font-bold mb-6">Reports</h1>

        {reports.length === 0 ? (
          <p className="text-zinc-400">No reports yet. Go scrape something!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reports.map(report => (
              <div
                key={report._id}
                onClick={() => navigate(`/reports/${report._id}`)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-zinc-400 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{report.scraperId?.label || 'Untitled'}</p>
                  <p className="text-zinc-400 text-sm mt-1">{report.url}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs text-zinc-500">{new Date(report.createdAt).toLocaleString()}</span>
                    <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{report.format}</span>
                    <span className="text-xs text-zinc-500">{report.cleanedData?.length || 0} items</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, report._id)}
                  className="text-red-400 hover:text-red-300 text-sm ml-4 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}