import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import IndexPage from './components/IndexPage';
import AdminPage from './components/AdminPage';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jornada" element={<IndexPage />} />
        <Route path="/index" element={<IndexPage />} />
        <Route path="/stats" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;