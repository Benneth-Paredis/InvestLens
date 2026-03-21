import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortfolioPage from './pages/PortfolioPage';
import AnalysisPage from './pages/AnalysisPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </BrowserRouter>
  );
}
