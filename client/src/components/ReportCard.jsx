import { Link } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReportCard({ report }) {
  const { isDark } = useDarkMode();

  const statusConfig = {
    completed: { icon: CheckCircle, colorClass: 'text-emerald-500' },
    pending: { icon: Clock, colorClass: 'text-accent' },
    failed: { icon: AlertCircle, colorClass: 'text-red-500' },
  };

  const status = report.status || 'completed';
  const StatusIcon = statusConfig[status]?.icon || CheckCircle;
  const statusClass = statusConfig[status]?.colorClass || 'text-emerald-500';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Link to={`/reports/${report._id}`}>
      <div
        className={`card-magical card-fancy border rounded-xl p-5 group`}
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-semibold`} style={{ color: 'var(--color-text-primary)' }}>
              {report.label || report.scraperId?.label || 'Untitled Report'}
            </h3>
            <p className={`text-sm mt-1 truncate`} style={{ color: 'var(--color-text-secondary)' }}>
              {report.url}
            </p>
          </div>
          <ExternalLink
            size={18}
            className={`transition-all duration-300 ease-out transform flex-shrink-0 ml-2 group-hover:text-primary group-hover:scale-110 group-hover:rotate-6`}
            style={{
              color: 'var(--color-text-secondary)',
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 group-hover:border-primary transition-colors duration-300"
             style={{
               borderTopColor: 'var(--color-border)',
               borderTopWidth: '1px',
             }}>
          <div className="flex items-center gap-2">
            <StatusIcon size={16} className={statusClass} />
            <span className={`text-sm font-medium ${statusClass}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <span className={`text-xs`} style={{ color: 'var(--color-text-secondary)' }}>
            {formatDate(report.createdAt || new Date())}
          </span>
        </div>

        {report.itemCount && (
          <div className="mt-3 pt-3" style={{ borderTopColor: 'var(--color-border)', borderTopWidth: '1px' }}>
            <p className={`text-sm`} style={{ color: 'var(--color-text-secondary)' }}>
              <span className="font-semibold text-accent">{report.itemCount}</span> items extracted
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
