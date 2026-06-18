import { useDarkMode } from '../context/DarkModeContext';

export default function StatCard({ icon: Icon, label, value, trend, accentColor = 'purple' }) {
  const { isDark } = useDarkMode();

  const trendClasses = trend >= 0 ? 'text-emerald-500' : 'text-red-500';

  const accentGradients = {
    amber: 'from-primary to-accent-soft',
    stone: 'from-secondary to-secondary-soft',
    lime: 'from-primary to-accent-soft',
    orange: 'from-primary to-accent-soft',
  };

  const accentTextColors = {
    amber: 'text-accent',
    stone: 'text-secondary',
    lime: 'text-accent',
    orange: 'text-accent',
  };

  return (
    <div
      className={`card-magical card-fancy border rounded-2xl p-6 group cursor-pointer`}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`bg-gradient-to-br ${accentGradients[accentColor] || accentGradients.amber} p-3 rounded-xl transform transition-all duration-300 ease-out group-hover:rotate-6 group-hover:scale-110`}
        >
          <Icon className="text-white" size={24} />
        </div>
        {trend !== undefined && (
          <span className={`${trendClasses} text-sm font-semibold`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <h3 className={`text-sm font-medium mb-1`} style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </h3>
      <p className={`text-3xl font-bold group-hover:text-primary transition-colors duration-300 ${accentTextColors[accentColor] || 'text-accent'}`}
         style={{
           color: 'var(--color-accent)',
         }}
      >
        {value}
      </p>
    </div>
  );
}
