import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reports from './pages/Reports';
import ReportView from './pages/ReportView';
import Schedules from './pages/Schedules';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportView />} />
        <Route path="/schedules" element={<Schedules />} />
      </Routes>
    </BrowserRouter>
  );
}