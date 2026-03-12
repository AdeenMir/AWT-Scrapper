import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReportById, deleteReport } from '../services/api';

const TableView = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-zinc-700">
          <th className="text-left py-2 px-4 text-zinc-400">Tag</th>
          <th className="text-left py-2 px-4 text-zinc-400">Text</th>
          <th className="text-left py-2 px-4 text-zinc-400">Link</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800 transition">
            <td className="py-2 px-4 text-zinc-500">{item.tag}</td>
            <td className="py-2 px-4">{item.text}</td>
            <td className="py-2 px-4">
              {item.href && <a href={item.href} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">link</a>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const JSONView = ({ data }) => (
  <pre className="bg-zinc-900 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const CardsView = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {data.map((item, i) => (
      <div key={i} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
        <span className="text-xs text-zinc-500 uppercase">{item.tag}</span>
        <p className="text-sm mt-1">{item.text}</p>
        {item.href && (
          <a href={item.href} target="_blank" rel="noreferrer" className="text-blue-400 text-xs hover:underline mt-2 block">
            {item.href}
          </a>
        )}
      </div>
    ))}
  </div>
);

const CSVView = ({ data }) => {
  const csv = ['tag,text,href', ...data.map(i => `${i.tag},"${i.text}",${i.href || ''}`)].join('\n');
  const download = () => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
  };
  return (
    <div>
      <button onClick={download} className="mb-4 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition">
        Download CSV
      </button>
      <pre className="bg-zinc-900 rounded-lg p-4 text-sm text-yellow-400 overflow-x-auto">{csv}</pre>
    </div>
  );
};

export default function ReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [format, setFormat] = useState('table');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportById(id).then(res => {
      setReport(res.data);
      setFormat(res.data.format);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    await deleteReport(id);
    navigate('/reports');
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>;
  if (!report) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Report not found.</div>;

  const data = report.cleanedData || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/reports')} className="text-zinc-400 hover:text-white mb-6 text-sm transition">← Back</button>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{report.scraperId?.label || 'Report'}</h1>
            <p className="text-zinc-400 text-sm mt-1">{report.url}</p>
            <p className="text-zinc-500 text-xs mt-1">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm transition">Delete</button>
        </div>

        <div className="flex gap-2 mb-6">
          {['table', 'json', 'cards', 'csv'].map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${format === f ? 'bg-white text-black' : 'border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-400'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {format === 'table' && <TableView data={data} />}
        {format === 'json' && <JSONView data={data} />}
        {format === 'cards' && <CardsView data={data} />}
        {format === 'csv' && <CSVView data={data} />}
      </div>
    </div>
  );
}