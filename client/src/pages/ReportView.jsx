import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, deleteReport } from '../services/api';
import { useDarkMode } from '../context/DarkModeContext';
import Layout from '../components/Layout';
import { Download, Trash2, Copy, Check, ChevronLeft } from 'lucide-react';

const isStructuredRow = (item) => item && item.fields && typeof item.fields === 'object';

const getDynamicColumns = (data) => {
  const cols = new Set();
  data.forEach((item) => {
    if (isStructuredRow(item)) {
      Object.keys(item.fields).forEach((k) => cols.add(k));
    }
  });
  return Array.from(cols);
};

const TableView = ({ data, isDark }) => {
  const dynamicColumns = useMemo(() => getDynamicColumns(data), [data]);
  const hasStructured = dynamicColumns.length > 0;

  const tableHeaderStyle = {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  const tableRowStyle = {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text-primary)',
  };

  const muteStyle = {
    color: 'var(--color-text-secondary)',
  };

  if (!hasStructured) {
    return (
      <div className="overflow-x-auto rounded-xl shadow-lg border" style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={tableHeaderStyle}>
              <th className={`text-left py-3 px-4 font-semibold`} style={{ color: 'var(--color-text-primary)' }}>Tag</th>
              <th className={`text-left py-3 px-4 font-semibold`} style={{ color: 'var(--color-text-primary)' }}>Text</th>
              <th className={`text-left py-3 px-4 font-semibold`} style={{ color: 'var(--color-text-primary)' }}>Link</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i} className={`border-b transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg`} style={tableRowStyle}>
                <td className={`py-3 px-4`} style={{ color: 'var(--color-text-secondary)' }}>{item.tag}</td>
                <td className={`py-3 px-4`} style={{ color: 'var(--color-text-primary)' }}>{item.text}</td>
                <td className="py-3 px-4">
                  {item.href && (
                    <a href={item.href} target="_blank" rel="noreferrer" className="font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
                      Visit ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border" style={{
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
    }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={tableHeaderStyle}>
            {dynamicColumns.map((col) => (
              <th key={col} className={`text-left py-3 px-4 font-semibold capitalize`} style={{ color: 'var(--color-text-primary)' }}>
                {col}
              </th>
            ))}
            <th className={`text-left py-3 px-4 font-semibold`} style={{ color: 'var(--color-text-primary)' }}>Link</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => {
            const row = isStructuredRow(item) ? item.fields : {};
            const rowLink = item.href || row.link || row.url || null;

            return (
              <tr key={i} className={`border-b transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg`} style={tableRowStyle}>
                {dynamicColumns.map((col) => (
                  <td key={`${i}-${col}`} className={`py-3 px-4 align-top`} style={{ color: 'var(--color-text-primary)' }}>
                    {row[col] ?? <span style={muteStyle}>—</span>}
                  </td>
                ))}
                <td className="py-3 px-4">
                  {rowLink ? (
                    <a href={rowLink} target="_blank" rel="noreferrer" className="font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
                      Visit ↗
                    </a>
                  ) : (
                    <span style={muteStyle}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const JSONView = ({ data, isDark }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <button onClick={handleCopy} className="btn-primary-magical inline-flex items-center gap-2">
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? 'Copied!' : 'Copy JSON'}
      </button>
      <pre className="rounded-xl p-6 text-sm overflow-x-auto font-mono shadow-inner border"
           style={{
             backgroundColor: 'var(--color-surface)',
             borderColor: 'var(--color-border)',
             color: 'var(--color-accent)',
           }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

const CardsView = ({ data, isDark }) => {
  const structured = data.some(isStructuredRow);

  if (!structured) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, i) => (
          <div key={i} className="card-magical border p-4 rounded-lg" style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}>
            <span className={`text-xs font-semibold uppercase tracking-wide`}
                  style={{ color: 'var(--color-text-secondary)' }}>
              {item.tag}
            </span>
            <p className={`text-sm mt-2`} style={{ color: 'var(--color-text-primary)' }}>
              {item.text}
            </p>
            {item.href && (
              <a href={item.href} target="_blank" rel="noreferrer" className="link-magical text-xs font-semibold mt-3 block">
                {item.href} ↗
              </a>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, i) => {
        const row = isStructuredRow(item) ? item.fields : {};
        const entries = Object.entries(row);
        const link = item.href || row.link || row.url || null;

        return (
          <div key={i} className="card-magical border p-4 rounded-lg" style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}>
            <div className="space-y-3">
              {entries.length === 0 ? (
                <p className={`text-sm`} style={{ color: 'var(--color-text-secondary)' }}>No fields</p>
              ) : (
                entries.map(([k, v]) => (
                  <div key={k}>
                    <p className={`text-xs uppercase tracking-wide font-semibold`}
                       style={{ color: 'var(--color-text-secondary)' }}>
                      {k}
                    </p>
                    <p className={`text-sm break-words`} style={{ color: 'var(--color-text-primary)' }}>
                      {String(v ?? '—')}
                    </p>
                  </div>
                ))
              )}
            </div>

            {link && (
              <a href={link} target="_blank" rel="noreferrer" className="link-magical text-xs font-semibold mt-4 block">
                {link} ↗
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

const CSVView = ({ data, isDark }) => {
  const dynamicColumns = getDynamicColumns(data);
  const hasStructured = dynamicColumns.length > 0;

  const csv = useMemo(() => {
    if (!hasStructured) {
      return ['tag,text,href', ...data.map((i) => `${i.tag},"${(i.text || '').replace(/"/g, '""')}",${i.href || ''}`)].join('\n');
    }

    const headers = [...dynamicColumns, 'href'];
    const rows = data.map((item) => {
      const row = isStructuredRow(item) ? item.fields : {};
      const link = item.href || row.link || row.url || '';
      return headers
        .map((h) => {
          const val = h === 'href' ? link : row[h] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }, [data, dynamicColumns, hasStructured]);

  const download = (type) => {
    let content = csv;
    let filename = 'report.csv';
    let mime = 'text/csv';

    if (type === 'excel') {
      if (!hasStructured) {
        content = ['tag\ttext\thref', ...data.map((i) => `${i.tag}\t${(i.text || '').replace(/\t/g, ' ')}\t${i.href || ''}`)].join('\n');
      } else {
        const headers = [...dynamicColumns, 'href'];
        const rows = data.map((item) => {
          const row = isStructuredRow(item) ? item.fields : {};
          const link = item.href || row.link || row.url || '';
          return headers.map((h) => String(h === 'href' ? link : row[h] ?? '').replace(/\t/g, ' ')).join('\t');
        });
        content = [headers.join('\t'), ...rows].join('\n');
      }
      filename = 'report.xls';
      mime = 'application/vnd.ms-excel';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => download('csv')} className="btn-secondary-magical inline-flex items-center gap-2">
          <Download size={18} />
          Download CSV
        </button>
        <button onClick={() => download('excel')} className="btn-primary-magical inline-flex items-center gap-2">
          <Download size={18} />
          Download Excel
        </button>
      </div>
      <pre className="rounded-xl p-6 text-sm overflow-x-auto font-mono shadow-inner border"
           style={{
             backgroundColor: 'var(--color-surface)',
             borderColor: 'var(--color-border)',
             color: 'var(--color-accent)',
           }}>
        {csv}
      </pre>
    </div>
  );
};

const DiffView = ({ diffData, isDark }) => {
  if (!diffData) {
    return (
      <div className="rounded-xl p-8 text-center shadow-lg border"
           style={{
             backgroundColor: 'var(--color-surface)',
             borderColor: 'var(--color-border)',
             color: 'var(--color-text-secondary)',
           }}>
        <p>
          No previous report to compare against.
        </p>
      </div>
    );
  }

  const { added = [], removed = [] } = diffData;

  if (added.length === 0 && removed.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center shadow-lg border"
           style={{
             backgroundColor: 'var(--color-surface)',
             borderColor: 'var(--color-border)',
             color: 'var(--color-text-secondary)',
           }}>
        <p>
          No changes detected since last scrape.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {added.length > 0 && (
        <div>
          <h3 className="font-bold mb-4 text-lg flex items-center gap-2" style={{ color: '#10b981' }}>
            <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-sm text-white">+</span>
            {added.length} Added
          </h3>
          <div className="grid gap-2">
            {added.map((item, i) => (
              <div key={i} className={`rounded-lg px-4 py-3 border transition-all duration-300`}
                   style={{
                     backgroundColor: 'rgba(16, 185, 129, 0.1)',
                     borderColor: 'rgba(16, 185, 129, 0.3)',
                     color: '#10b981',
                   }}>
                <p className="text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {removed.length > 0 && (
        <div>
          <h3 className="font-bold mb-4 text-lg flex items-center gap-2" style={{ color: '#ef4444' }}>
            <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-sm text-white">−</span>
            {removed.length} Removed
          </h3>
          <div className="grid gap-2">
            {removed.map((item, i) => (
              <div key={i} className={`rounded-lg px-4 py-3 border transition-all duration-300 line-through`}
                   style={{
                     backgroundColor: 'rgba(239, 68, 68, 0.1)',
                     borderColor: 'rgba(239, 68, 68, 0.3)',
                     color: '#ef4444',
                   }}>
                <p className="text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const [report, setReport] = useState(null);
  const [format, setFormat] = useState('table');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await getReportById(id);
        setReport(res.data.report || res.data);
        setFormat(res.data.report?.format || res.data?.format || 'table');
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteReport(id);
      navigate('/reports');
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-pulse space-y-4">
            <div className="w-64 h-8 rounded-xl border" style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }} />
            <div className="w-96 h-4 rounded-lg border" style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }} />
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className={`text-lg`} style={{ color: 'var(--color-text-secondary)' }}>Report not found</p>
        </div>
      </Layout>
    );
  }

  const data = report.cleanedData || [];

  return (
    <Layout>
      <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <button
              onClick={() => navigate('/reports')}
              className={`flex items-center gap-2 mb-4 transition-all duration-300 ease-out hover:-translate-x-1`}
              style={{ color: 'var(--color-primary)' }}
            >
              <ChevronLeft size={20} />
              Back to Reports
            </button>
            <h1 className={`text-4xl font-bold mb-2`} style={{ color: 'var(--color-text-primary)' }}>
              {report.label || report.scraperId?.label || 'Report'}
            </h1>
            <p className={`text-sm mb-2`} style={{ color: 'var(--color-text-secondary)' }}>{report.url}</p>
            <p className={`text-xs`} style={{ color: 'var(--color-text-secondary)' }}>
              {new Date(report.createdAt).toLocaleString()}
            </p>

            {/* Status Tags */}
            {report.diffData && (report.diffData.addedCount > 0 || report.diffData.removedCount > 0) && (
              <div className="flex gap-2 mt-4">
                {report.diffData.addedCount > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border" style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                  }}>
                    +{report.diffData.addedCount} new
                  </span>
                )}
                {report.diffData.removedCount > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border" style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                  }}>
                    −{report.diffData.removedCount} removed
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`p-3 rounded-lg transition-all duration-300 ease-out hover:-translate-y-1`}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="rounded-2xl p-8 max-w-sm shadow-2xl border" style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}>
              <h2 className={`text-lg font-bold mb-3`} style={{ color: 'var(--color-text-primary)' }}>
                Delete Report?
              </h2>
              <p className={`mb-6`} style={{ color: 'var(--color-text-secondary)' }}>
                This action cannot be undone.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary-magical flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="btn-primary-magical flex-1"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Format Tabs */}
        <div className="rounded-2xl p-6 mb-8 transition-all duration-300 shadow-lg border" style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}>
          <div className="flex flex-wrap gap-3">
            {['table', 'json', 'cards', 'csv', 'diff'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={format === f ? 'btn-primary-magical' : 'btn-secondary-magical'}
              >
                {f.toUpperCase()}
                {f === 'diff' &&
                  (report.diffData?.addedCount > 0 || report.diffData?.removedCount > 0) && (
                    <span className="ml-2 w-2 h-2 inline-block bg-red-400 rounded-full animate-pulse" />
                  )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {format === 'table' && <TableView data={data} isDark={isDark} />}
          {format === 'json' && <JSONView data={data} isDark={isDark} />}
          {format === 'cards' && <CardsView data={data} isDark={isDark} />}
          {format === 'csv' && <CSVView data={data} isDark={isDark} />}
          {format === 'diff' && <DiffView diffData={report.diffData} isDark={isDark} />}
        </div>

        {/* Items Count */}
        <div className="mt-8 text-center">
          <p className={`text-sm font-semibold`} style={{ color: 'var(--color-text-secondary)' }}>
            Total items extracted: <span className="text-lg" style={{ color: 'var(--color-accent)' }}>{data.length}</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}