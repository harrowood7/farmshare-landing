import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/layout';
import ScrollToTop from './components/ScrollToTop';
import {
  Home,
  Mission,
  Producers,
  Processors,
  Buyers,
  Privacy,
  Terms,
  ServiceAgreement,
  ReleaseNotes,
  ReleaseNoteDetail,
  Admin
} from './pages';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-cream text-stone-900 font-sans">
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/producers" element={<Producers />} />
          <Route path="/processors" element={<Processors />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/service-agreement" element={<ServiceAgreement />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
          <Route path="/release-notes/:slug" element={<ReleaseNoteDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;