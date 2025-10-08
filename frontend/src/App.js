import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

// Import pages
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';
import ServiceDetails from './pages/ServiceDetails';
import Agendamento from './pages/Agendamento';
import CasosSucesso from './pages/CasosSucesso';
import FAQ from './pages/FAQ';
import Depoimentos from './pages/Depoimentos';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';

// Import components
import WhatsAppButton from './components/WhatsAppButton';

function App() {
  return (
    <div className="App min-h-screen bg-slate-900">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/casos-sucesso" element={<CasosSucesso />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/depoimentos" element={<Depoimentos />} />
        </Routes>
      </Router>
      <WhatsAppButton />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;