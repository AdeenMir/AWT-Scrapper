import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSchedules, createSchedule, toggleSchedule, deleteSchedule, getReports, verifyPayment } from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';
import Layout from '../components/Layout';
import PaymentForm from '../components/PaymentForm';
import { Clock, Play, Pause, Trash2, Plus, AlertCircle, X } from 'lucide-react';

const INTERVALS = [
  { label: 'Every minute', value: '* * * * *', isPaid: true, price: '$5.00' },
  { label: 'Every hour', value: '0 * * * *', isPaid: true, price: '$2.00' },
  { label: 'Every 6 hours', value: '0 */6 * * *', isPaid: true, price: '$1.00' },
  { label: 'Every 12 hours', value: '0 */12 * * *', isPaid: true, price: '$0.75' },
  { label: 'Every day', value: '0 0 * * *', isPaid: true, price: '$0.50' },
  { label: 'Every week', value: '0 0 * * 0', isPaid: false, price: 'Free' },
];

const getPaidInterval = (interval) => {
  return INTERVALS.find((i) => i.value === interval);
};

export default function Schedules() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [schedules, setSchedules] = useState([]);
  const [scrapers, setScrapers] = useState([]);
  const [form, setForm] = useState({ scraperId: '', interval: '0 * * * *' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Payment flow states
  const [showPayment, setShowPayment] = useState(false);
  const [pendingSchedule, setPendingSchedule] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schedulesRes, reportsRes] = await Promise.all([getSchedules(), getReports()]);
        setSchedules(schedulesRes.data.schedules || schedulesRes.data || []);

        const reportsData = reportsRes.data.reports || reportsRes.data || [];
        const unique = [];
        const seen = new Set();
        reportsData.forEach((rep) => {
          const scraper = rep.scraperId || rep;
          if (scraper?._id && !seen.has(scraper._id)) {
            seen.add(scraper._id);
            unique.push(scraper);
          }
        });
        setScrapers(unique);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!form.scraperId) {
      setError('Please select a scraper');
      return;
    }
    setError('');

    // Check if this is a paid schedule
    const selectedInterval = getPaidInterval(form.interval);
    if (selectedInterval && selectedInterval.isPaid) {
      setPendingSchedule(form);
      setShowPayment(true);
      return;
    }

    // For free schedules, create directly
    try {
      const res = await createSchedule(form);
      const selectedScraper = scrapers.find((s) => s._id === form.scraperId);
      setSchedules([...schedules, { ...res.data, scraperId: selectedScraper || res.data.scraperId }]);
      setForm({ scraperId: '', interval: '0 * * * *' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create schedule');
    }
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      // Verify payment
      await verifyPayment({ paymentId: paymentResponse.paymentId });

      // Create schedule with payment
      const scheduleData = {
        ...pendingSchedule,
        paymentId: paymentResponse.paymentId,
      };

      const res = await createSchedule(scheduleData);
      const selectedScraper = scrapers.find((s) => s._id === pendingSchedule.scraperId);
      setSchedules([...schedules, { ...res.data, scraperId: selectedScraper || res.data.scraperId }]);
      
      setShowPayment(false);
      setPendingSchedule(null);
      setPaymentData(null);
      setForm({ scraperId: '', interval: '0 * * * *' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create schedule');
      setShowPayment(false);
      setPendingSchedule(null);
    }
  };

  const handlePaymentError = (err) => {
    console.error('Payment error:', err);
    // Keep the payment form open for retry
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPendingSchedule(null);
    setPaymentData(null);
  };

  const handleToggle = async (id) => {
    try {
      const res = await toggleSchedule(id);
      setSchedules(schedules.map((s) => (s._id === id ? res.data : s)));
    } catch (err) {
      console.error('Error toggling schedule:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSchedule(id);
      setSchedules(schedules.filter((s) => s._id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const bgClasses = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const inputBgClasses = isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500';
  const textClasses = isDark ? 'text-slate-300' : 'text-slate-600';

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-pulse space-y-4">
            <div className={`w-64 h-8 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`w-96 h-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Scraping Schedules
          </h1>
          <p className={textClasses}>Automate your web scraping with scheduled tasks</p>
        </div>

        {/* Create Schedule Section */}
        <div className={`${bgClasses} border rounded-2xl p-8 mb-8 card-fancy`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Plus size={24} className="text-accent" />
            Create New Schedule
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 animate-fade-in-up flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Scraper
                </label>
                <select
                  value={form.scraperId}
                  onChange={(e) => setForm({ ...form, scraperId: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${inputBgClasses}`}
                >
                  <option value="">Choose a scraper...</option>
                  {scrapers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.label || 'Untitled'} — {s.url}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Schedule Frequency
                </label>
                <select
                  value={form.interval}
                  onChange={(e) => setForm({ ...form, interval: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${inputBgClasses}`}
                >
                  {INTERVALS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label} ({i.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full md:w-auto px-8 py-3 rounded-lg bg-primary text-background font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Create Schedule
            </button>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && pendingSchedule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md">
              <button
                onClick={handlePaymentCancel}
                className={`absolute -top-2 -right-2 p-2 rounded-full ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} z-10`}
              >
                <X className="w-5 h-5" />
              </button>
              <PaymentForm
                interval={pendingSchedule.interval}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          </div>
        )}

        {/* Schedules List */}
        <div className="animate-fade-in-up">
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Active Schedules
          </h2>

          {schedules.length === 0 ? (
            <div className={`${bgClasses} border rounded-2xl p-12 text-center`}>
              <Clock size={48} className="mx-auto mb-4 text-slate-400 opacity-50" />
              <p className={`${textClasses} text-lg mb-2`}>No schedules yet</p>
              <p className={`${textClasses} text-sm`}>Create your first schedule to automate scraping tasks</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {schedules.map((schedule, idx) => (
                <div
                  key={schedule._id}
                  className={`${bgClasses} border rounded-2xl p-6 card-fancy group relative animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-3 h-3 rounded-full animate-pulse ${
                        schedule.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  {/* Paid Badge */}
                  {schedule.isPaid && (
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50">
                        PREMIUM
                      </span>
                    </div>
                  )}

                  <div className="mb-4 flex items-start gap-3 mt-6">
                    <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
                      schedule.status === 'active'
                        ? 'bg-emerald-500/20'
                        : 'bg-slate-700/50'
                    }`}>
                      <Clock
                        size={24}
                        className={
                          schedule.status === 'active'
                            ? 'text-emerald-500'
                            : 'text-slate-400'
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {schedule.scraperId?.label || 'Untitled Schedule'}
                      </h3>
                      <p className={`${textClasses} text-sm`}>
                        {schedule.scraperId?.url}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        Frequency
                      </span>
                      <span className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'} bg-slate-700/30 px-3 py-1 rounded-full`}>
                        {schedule.interval}
                      </span>
                    </div>

                    {schedule.planType && schedule.planType !== 'free' && (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          Plan
                        </span>
                        <span className="text-sm font-semibold text-blue-400 px-3 py-1 rounded-full bg-blue-500/20">
                          {schedule.planType}
                        </span>
                      </div>
                    )}

                    {schedule.lastRun && (
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                          Last Run
                        </span>
                        <span className={`text-sm ${textClasses}`}>
                          {new Date(schedule.lastRun).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        Status
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        schedule.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                      }`}>
                        {schedule.status === 'active' ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggle(schedule._id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-out ${
                        schedule.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border border-emerald-500/50 hover:-translate-y-0.5 hover:shadow-lg'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600 hover:-translate-y-0.5 hover:shadow-lg'
                      }`}
                    >
                      {schedule.status === 'active' ? (
                        <>
                          <Pause size={16} />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Resume
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(schedule._id)}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg border border-red-500/50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === schedule._id && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm animate-fade-in">
                      <div className={`${bgClasses} border rounded-xl p-6 max-w-xs`}>
                        <p className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Delete this schedule?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300 ease-out font-semibold ${
                              isDark
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:-translate-y-0.5 hover:shadow-lg'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:-translate-y-0.5 hover:shadow-lg'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}