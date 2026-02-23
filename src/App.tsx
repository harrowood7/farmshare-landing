import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header, Footer } from './components/layout';
import ScrollToTop from './components/ScrollToTop';
import {
  Home,
  Mission,
  Processors,
  FindProcessor,
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
          <Route path="/processors" element={<Processors />} />
          <Route path="/find-a-processor" element={<FindProcessor />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/service-agreement" element={<ServiceAgreement />} />
          <Route path="/release-notes" element={<ReleaseNotes />} />
          <Route path="/release-notes/:slug" element={<ReleaseNoteDetail />} />
          <Route path="/admin" element={<Admin />} />
          {/* Redirects for removed pages */}
          <Route path="/producers" element={<Navigate to="/" replace />} />
          <Route path="/buyers" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
