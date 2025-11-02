import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DecisionsPage from './pages/DecisionsPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<DecisionsPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
