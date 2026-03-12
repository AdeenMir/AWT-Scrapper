import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchedules, createSchedule, toggleSchedule, deleteSchedule, getReports } from '../services/api';

const INTERVALS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 */12 * * *' },
  { label: 'Every day', value: '0 0 * * *' },
  { label: 'Every week', value: '0 0 * * 0' },
];

export default function Schedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [scrapers, setScrapers] = useState([]);
  const [form, setForm] = useState({ scraperId: '', interval: '0 * * * *' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSchedules(), getReports()]).then(([s, r]) => {
      setSchedules(s.data);
      // Extract unique scrapers from reports
      const unique = [];
      const seen = new Set();
      r.data.forEach(rep => {
        if (rep.scraperId && !seen.has(rep.scraperId._id)) {
          seen.add(rep.scraperId._id);
          unique.push(rep.scraperId);
        }
      });
      setScrapers(unique);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.scraperId) {
      setError('Please select a scraper');
      return;
    }
    setError('');
    try {
      const res = await createSchedule(form);
      setSchedules([...schedules, res.data]);
      setForm({ scraperId: '', interval: '0 * * * *' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create schedule');
    }
  };

  const handleToggle = async (id) => {
    const res = await toggleSchedule(id);
    setSchedules(schedules.map(s => s._id === id ? res.data : s));
  };

  const handleDelete = async (id) => {
    await deleteSchedule(id);
    setSchedules(schedules.filter(s => s._id !== id));
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="text-zinc-400 hover:text-white mb-6 text-sm transition">← Back</button>
        <h1 className="text-3xl font-bold mb-6">Schedules</h1>

        {/* Create Schedule */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">New Schedule</h2>
          <div className="flex flex-col gap-3">
            <select
              value={form.scraperId}
              onChange={e => setForm({ ...form, scraperId: e.target.value })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-zinc-400"
            >
              <option value="">Select a scraper</option>
              {scrapers.map(s => (
                <option key={s._id} value={s._id}>{s.label} — {s.url}</option>
              ))}
            </select>
            <select
              value={form.interval}
              onChange={e => setForm({ ...form, interval: e.target.value })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-zinc-400"
            >
              {INTERVALS.map(i => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleCreate}
              className="bg-white text-black font-semibold rounded-lg px-4 py-3 hover:bg-zinc-200 transition"
            >
              Create Schedule
            </button>
          </div>
        </div>

        {/* Schedules List */}
        {schedules.length === 0 ? (
          <p className="text-zinc-400">No schedules yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {schedules.map(schedule => (
              <div key={schedule._id} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{schedule.scraperId?.label || 'Unknown'}</p>
                  <p className="text-zinc-400 text-sm mt-1">{schedule.scraperId?.url}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{schedule.interval}</span>
                    {schedule.lastRun && (
                      <span className="text-xs text-zinc-500">Last run: {new Date(schedule.lastRun).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => handleToggle(schedule._id)}
                    className={`text-sm px-3 py-1 rounded-lg transition ${schedule.status === 'active' ? 'bg-green-900 text-green-400 hover:bg-green-800' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                  >
                    {schedule.status === 'active' ? 'Active' : 'Paused'}
                  </button>
                  <button
                    onClick={() => handleDelete(schedule._id)}
                    className="text-red-400 hover:text-red-300 text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}