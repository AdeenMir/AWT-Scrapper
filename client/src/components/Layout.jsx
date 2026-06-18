import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
      <footer className="border-t" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">WebScrapper</p>
            <p className="text-sm text-secondary mt-1">Build and schedule scraping jobs with confidence.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-primary">
            <Link to="/home" className="link-magical">Home</Link>
            <Link to="/reports" className="link-magical">Reports</Link>
            <Link to="/schedules" className="link-magical">Schedules</Link>
            <Link to="/faq" className="link-magical">FAQ</Link>
            <Link to="/contact" className="link-magical">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
