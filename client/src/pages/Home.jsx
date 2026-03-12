import { useState } from 'react';
import { scrapeUrl } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ url: '', label: '', format: 'table', selector: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.url || !form.label) {
      setError('URL and label are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await scrapeUrl(form);
      navigate(`/reports/${res.data.report._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Scraping failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">WebScraper</h1>
        <p className="text-zinc-400 mb-8">Extract, clean and display data from any website.</p>

        <div className="flex flex-col gap-4">
          <input
            name="url"
            placeholder="https://example.com"
            value={form.url}
            onChange={handleChange}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
          <input
            name="label"
            placeholder="Label (e.g. Tech News)"
            value={form.label}
            onChange={handleChange}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
          <input
            name="selector"
            placeholder="CSS Selector (optional, e.g. .article)"
            value={form.selector}
            onChange={handleChange}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
          <select
            name="format"
            value={form.format}
            onChange={handleChange}
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-zinc-400"
          >
            <option value="table">Table</option>
            <option value="json">JSON</option>
            <option value="cards">Cards</option>
            <option value="csv">CSV</option>
          </select>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? 'Scraping...' : 'Scrape'}
          </button>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigate('/reports')}
              className="flex-1 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-400 hover:text-white hover:border-zinc-400 transition"
            >
              View Reports
            </button>
            <button
              onClick={() => navigate('/schedules')}
              className="flex-1 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-400 hover:text-white hover:border-zinc-400 transition"
            >
              Schedules
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}