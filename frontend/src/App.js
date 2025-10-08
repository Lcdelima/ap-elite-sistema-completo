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

// Import admin modules
import SmartDashboard from './pages/admin/SmartDashboard';
import InterceptionAnalysis from './pages/admin/InterceptionAnalysis';
import CaseManagement from './pages/admin/CaseManagement';
import ClientManagement from './pages/admin/ClientManagement';
import DigitalForensics from './pages/admin/DigitalForensics';
import FinancialManagement from './pages/admin/FinancialManagement';
import Communications from './pages/admin/Communications';
import Calendar from './pages/admin/Calendar';
import ReportsExport from './pages/admin/ReportsExport';

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
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/client/dashboard" element={<ClientDashboard />} />
          
          {/* Admin Module Routes */}
          <Route path="/admin/smart-dashboard" element={<SmartDashboard />} />
          <Route path="/admin/interception" element={<InterceptionAnalysis />} />
          <Route path="/admin/cases" element={<CaseManagement />} />
          <Route path="/admin/clients" element={<ClientManagement />} />
          <Route path="/admin/forensics" element={<DigitalForensics />} />
          <Route path="/admin/financial" element={<FinancialManagement />} />
          <Route path="/admin/communications" element={<Communications />} />
          <Route path="/admin/calendar" element={<Calendar />} />
          <Route path="/admin/reports" element={<ReportsExport />} />
        </Routes>
      </Router>
      <WhatsAppButton />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;