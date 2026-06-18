import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, deleteReport } from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';
import Layout from '../components/Layout';
import ReportCard from '../components/ReportCard';
import { Search, Filter, Trash2, AlertCircle } from 'lucide-react';

export default function Reports() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getReports();
        const reportsData = res.data.reports || res.data || [];
        setReports(reportsData);
        setFiltered(reportsData);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    let result = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        (r.label || r.scraperId?.label || '').toLowerCase().includes(q) ||
        r.url?.toLowerCase().includes(q)
      );
    }

    if (formatFilter !== 'all') {
      result = result.filter(r => r.format === formatFilter);
    }

    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === 'most-items') result.sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));

    setFiltered(result);
  }, [search, formatFilter, sortBy, reports]);

  const handleDelete = async (id) => {
    try {
      await deleteReport(id);
      setReports(reports.filter(r => r._id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const bgClasses = 'surface-panel card-magical card-fancy';
  const inputBgClasses = 'input-magical text-primary placeholder:text-secondary border-2';
  const textClasses = 'text-secondary';

  const formContainerStyle = {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
  };

  return (
    <Layout>
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2`} style={{ color: 'var(--color-text-primary)' }}>
            All Reports
          </h1>
          <p className={textClasses}>Manage and view all your scraping reports</p>
        </div>

        {/* Filter Bar */}
        <div className={`${bgClasses} border rounded-2xl p-6 mb-8`} style={formContainerStyle}>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5" size={20} style={{ color: 'var(--color-text-secondary)' }} />
              <input
                placeholder="Search by label or URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${inputBgClasses}`}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Filters */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-semibold mb-2`} style={{ color: 'var(--color-text-primary)' }}>
                  Filter by Format
                </label>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClasses}`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="all">All Formats</option>
                  <option value="table">Table</option>
                  <option value="json">JSON</option>
                  <option value="cards">Cards</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2`} style={{ color: 'var(--color-text-primary)' }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${inputBgClasses}`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="most-items">Most Items</option>
                </select>
              </div>
              <div className="flex items-end">
                <div className="flex-1 px-4 py-3 surface-panel text-sm font-semibold flex items-center gap-2"
                     style={{
                       backgroundColor: 'var(--color-surface)',
                       borderColor: 'var(--color-border)',
                       color: 'var(--color-text-primary)',
                       border: '2px solid var(--color-border)',
                       borderRadius: '0.5rem',
                     }}>
                  <Filter size={18} />
                  {filtered.length} of {reports.length} reports
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`rounded-xl p-5 animate-pulse h-40 border`}
                   style={{
                     backgroundColor: 'var(--color-surface)',
                     borderColor: 'var(--color-border)',
                   }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-panel card-magical rounded-2xl p-12 text-center border" style={formContainerStyle}>
            <AlertCircle size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'var(--color-text-secondary)' }} />
            <p className={`${textClasses} text-lg mb-2`}>No reports found</p>
            <p className={`${textClasses} text-sm mb-6`}>
              {search || formatFilter !== 'all' ? 'Try adjusting your filters' : 'Start by creating a new scraper'}
            </p>
            {!search && formatFilter === 'all' && (
              <button
                onClick={() => navigate('/')}
                className="btn-primary-magical"
              >
                Create First Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((report, idx) => (
              <div key={report._id} className="group relative animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
                <ReportCard report={report} />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteConfirm(report._id);
                  }}
                  className={`absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '2px solid var(--color-border)',
                    color: '#ef4444',
                  }}
                >
                  <Trash2 size={18} />
                </button>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm === report._id && (
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center z-10 animate-fade-in" style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }}>
                    <div className="p-6 rounded-lg text-center max-w-xs border" style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}>
                      <p className="mb-4 font-semibold" style={{ color: 'var(--color-primary)' }}>
                        Delete this report?
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="transition-all duration-300 ease-out px-4 py-2 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="btn-primary-magical"
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
    </Layout>
  );
}