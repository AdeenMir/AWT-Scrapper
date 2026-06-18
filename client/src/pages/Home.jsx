import { useState, useEffect, useMemo } from 'react';
import { scrapeUrl, getReports } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import ReportCard from '../components/ReportCard';
import { Zap, FileText, Clock, TrendingUp, Plus, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const [form, setForm] = useState({
    url: '',
    label: '',
    format: 'table',
    itemSelector: '',
    fields: [
      { key: 'title', selector: 'a, h1, h2, h3, .title, .name', type: 'text', attr: '' }
    ],
    enablePagination: false,
    maxPages: 3,
    paginationType: 'query',
    nextPageSelector: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const recentReports = useMemo(() => {
    const sorted = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted.slice(0, 6);
  }, [reports]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getReports();
        setReports(res.data.reports || res.data || []);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setReportsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const addField = () => {
    setForm((p) => ({
      ...p,
      fields: [...p.fields, { key: '', selector: '', type: 'text', attr: '' }]
    }));
  };

  const updateField = (index, field, value) => {
    setForm((p) => ({
      ...p,
      fields: p.fields.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    }));
  };

  const removeField = (index) => {
    setForm((p) => ({
      ...p,
      fields: p.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.url || !form.label) {
      setError('URL and label are required');
      return;
    }

    const fields = form.fields
      .map((f) => ({
        ...f,
        key: (f.key || '').trim(),
        selector: (f.selector || '').trim(),
        attr: (f.attr || '').trim()
      }))
      .filter((f) => f.key && f.selector);

    if (!fields.length) {
      setError('Add at least one valid field');
      return;
    }

    const payload = {
      url: form.url.trim(),
      label: form.label.trim(),
      format: form.format,
      itemSelector: form.itemSelector.trim(),
      fields,
      enablePagination: !!form.enablePagination,
      maxPages: Number(form.maxPages) || 1,
      paginationType: form.paginationType,
      nextPageSelector: form.nextPageSelector.trim()
    };

    const reportTab = window.open('', '_blank');
    if (!reportTab) {
      setError('Please allow pop-ups to open the report results in a new tab.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await scrapeUrl(payload);
      reportTab.location.href = `${window.location.origin}/reports/${res.data.report._id}`;
      reportTab.focus();
    } catch (err) {
      if (!reportTab.closed) reportTab.close();
      setError(err.response?.data?.error || 'Scraping failed');
    } finally {
      setLoading(false);
    }
  };

  const bgClasses = 'surface-panel card-magical card-fancy';
  const textClasses = 'text-secondary';
  const inputBgClasses = 'input-magical text-primary placeholder:text-secondary border-2';

  const formContainerStyle = {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
  };

  const heroTagStyle = {
    backgroundColor: 'var(--color-surface-hover)',
    borderColor: 'var(--color-border)',
  };

  const heroTitleStyle = {
    color: isDark ? 'var(--color-text-primary)' : 'var(--color-primary)',
  };

  const heroAccentStyle = {
    color: 'var(--color-accent)',
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="mb-16 animate-fade-in-up">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4 px-4 py-2 rounded-full border" style={heroTagStyle}>
              <span className="text-sm font-semibold text-primary">Powerful Web Scraping</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span style={heroTitleStyle}>Extract Data</span>
              <br />
              <span style={heroAccentStyle}>Instantly</span>
            </h1>
            <p className={`${textClasses} text-lg mb-8 leading-relaxed`}>
              Powerful, flexible web scraping tool. Extract, filter, and organize any data from any website with an intuitive interface.
            </p>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => document.getElementById('scraper-form').scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary-magical"
              >
                Start Scraping
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="btn-secondary-magical"
              >
                View Reports
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Zap} label="Total Reports" value={reports.length} accentColor="purple" />
            <StatCard icon={FileText} label="Data Extracted" value="2.5K+" trend={12} accentColor="amber" />
            <StatCard icon={Clock} label="Avg Speed" value="2.3s" accentColor="teal" />
            <StatCard icon={TrendingUp} label="Success Rate" value="98.5%" accentColor="pink" />
          </div>
        </div>
      </div>

      {/* Scraper Form Section */}
      <div id="scraper-form" className="mb-16 scroll-mt-8 animate-fade-in-up">
        <h2 className={`text-3xl font-bold mb-8`} style={{ color: 'var(--color-text-primary)' }}>
          Create New Scraper
        </h2>
        <div className={`${bgClasses} border rounded-2xl p-8`} style={formContainerStyle}>
          {error && (
            <div className="alert-panel animate-fade-in-up">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-semibold mb-2`} style={{ color: 'var(--color-text-primary)' }}>
                  URL to Scrape
                </label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={`w-full px-4 py-3 rounded-lg ${inputBgClasses}`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2`} style={{ color: 'var(--color-text-primary)' }}>
                  Scraper Label
                </label>
                <input
                  type="text"
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="e.g., Product List"
                  className={`w-full px-4 py-3 rounded-lg ${inputBgClasses}`}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Item Selector */}
            <div>
              <label className={`block text-sm font-semibold mb-2`} style={{ color: 'var(--color-text-primary)' }}>
                Item Selector (CSS Selector for containers)
              </label>
              <input
                type="text"
                name="itemSelector"
                value={form.itemSelector}
                onChange={handleChange}
                placeholder="e.g., .product-item, article, li"
                className={`w-full px-4 py-3 rounded-lg ${inputBgClasses}`}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            {/* Fields */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2`} style={{ color: 'var(--color-text-primary)' }}>
                <FileText size={20} className="text-accent" />
                Extract Fields
              </h3>
              <div className="space-y-3">
                {form.fields.map((field, idx) => (
                  <div key={idx} className={`${bgClasses} transition-all duration-300`} style={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                  }}>
                    <div className="grid md:grid-cols-4 gap-3 items-end">
                      <div>
                        <label className={`text-xs font-semibold mb-1 block`} style={{ color: 'var(--color-text-secondary)' }}>
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => updateField(idx, 'key', e.target.value)}
                          placeholder="e.g., title"
                          className={`w-full px-3 py-2 rounded border text-sm ${inputBgClasses}`}
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={`text-xs font-semibold mb-1 block`} style={{ color: 'var(--color-text-secondary)' }}>
                          CSS Selector
                        </label>
                        <input
                          type="text"
                          value={field.selector}
                          onChange={(e) => updateField(idx, 'selector', e.target.value)}
                          placeholder="e.g., .title, h2, [data-price]"
                          className={`w-full px-3 py-2 rounded border text-sm ${inputBgClasses}`}
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                      <div>
                        <label className={`text-xs font-semibold mb-1 block`} style={{ color: 'var(--color-text-secondary)' }}>
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(idx, 'type', e.target.value)}
                          className={`w-full px-3 py-2 rounded border text-sm ${inputBgClasses}`}
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          <option value="text">Text</option>
                          <option value="attr">Attribute</option>
                          <option value="html">HTML</option>
                        </select>
                      </div>
                      {form.fields.length > 1 && (
                        <button
                          onClick={() => removeField(idx)}
                          className="px-3 py-2 rounded border text-sm font-semibold transition-all duration-300"
                          style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addField}
                className="btn-secondary-magical mt-4"
              >
                <Plus size={18} /> Add Field
              </button>
            </div>

            {/* Pagination */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enablePagination"
                  checked={form.enablePagination}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-2"
                  style={{
                    borderColor: 'var(--color-border)',
                    accentColor: 'var(--color-primary)',
                  }}
                />
                <span className={`font-semibold`} style={{ color: 'var(--color-text-primary)' }}>
                  Enable Pagination
                </span>
              </label>

              {form.enablePagination && (
                <div className={`mt-4 grid md:grid-cols-3 gap-4 p-4 rounded-lg ${bgClasses}`} style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}>
                  <div>
                    <label className={`text-sm font-semibold mb-2 block`} style={{ color: 'var(--color-text-primary)' }}>
                      Max Pages
                    </label>
                    <input
                      type="number"
                      name="maxPages"
                      value={form.maxPages}
                      onChange={handleChange}
                      min="1"
                      className={`w-full px-3 py-2 rounded border text-sm ${inputBgClasses}`}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-2 block`} style={{ color: 'var(--color-text-primary)' }}>
                      Type
                    </label>
                    <select
                      name="paginationType"
                      value={form.paginationType}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded border text-sm ${inputBgClasses}`}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <option value="query">Query Parameter</option>
                      <option value="path">Path Parameter</option>
                      <option value="click">Click Next Button</option>
                    </select>
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-2 block`} style={{ color: 'var(--color-text-primary)' }}>
                      Next Page Selector
                    </label>
                    <input
                      type="text"
                      name="nextPageSelector"
                      value={form.nextPageSelector}
                      onChange={handleChange}
                      placeholder=".next-btn, .pagination a.next"
                      className={`w-full px-3 py-2 rounded border text-sm ${inputBgClasses}`}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary-magical flex-1 gap-2"
              >
                <Zap size={20} />
                {loading ? 'Scraping...' : 'Start Scraping'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className={`text-3xl font-bold`} style={{ color: 'var(--color-text-primary)' }}>
              Recent Reports
            </h2>
            <p className={textClasses}>Your latest scraping activities</p>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="btn-secondary-magical flex items-center gap-2 group"
          >
            View All
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {reportsLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`rounded-xl p-5 animate-pulse h-40 border`}
                   style={{
                     backgroundColor: 'var(--color-surface)',
                     borderColor: 'var(--color-border)',
                   }}
              />
            ))}
          </div>
        ) : recentReports.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <div key={report._id} className="animate-fade-in-up">
                <ReportCard report={report} />
              </div>
            ))}
          </div>
        ) : (
          <div className={`surface-panel card-magical border rounded-2xl p-12 text-center`} style={formContainerStyle}>
            <FileText size={48} className="mx-auto mb-4 opacity-50"
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <p className={`${textClasses} text-lg`}>No reports yet. Start scraping to see your reports here!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}