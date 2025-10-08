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
import AthenaMain from './pages/admin/AthenaMain';

// Athena modules
import AthenaDashboard from './pages/athena/Dashboard';
import AthenaClients from './pages/athena/Clients';
import AthenaProcesses from './pages/athena/Processes';
import AthenaCommunications from './pages/athena/Communications';
import AthenaCalendar from './pages/athena/Calendar';
import AthenaMeetingLinks from './pages/athena/MeetingLinks';
import AthenaVideoConference from './pages/athena/VideoConference';
import AthenaForensics from './pages/athena/Forensics';
import AthenaPhoneInterceptions from './pages/athena/PhoneInterceptions';
import AthenaDataInterceptions from './pages/athena/DataInterceptions';
import AthenaDataExtraction from './pages/athena/DataExtraction';
import AthenaERBs from './pages/athena/ERBs';
import AthenaIPED from './pages/athena/IPED';
import AthenaEvidenceProcessing from './pages/athena/EvidenceProcessing';
import AthenaProcessAnalysis from './pages/athena/ProcessAnalysis';
import AthenaReports from './pages/athena/Reports';
import AthenaFinancial from './pages/athena/Financial';
import AthenaIntelligentDashboards from './pages/athena/IntelligentDashboards';

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
          <Route path="/athena" element={<AthenaMain />} />
          
          {/* Athena Module Routes */}
          <Route path="/athena/dashboard" element={<AthenaDashboard />} />
          <Route path="/athena/clients" element={<AthenaClients />} />
          <Route path="/athena/processes" element={<AthenaProcesses />} />
          <Route path="/athena/communications" element={<AthenaCommunications />} />
          <Route path="/athena/calendar" element={<AthenaPlaceholder title="Calendário Corporativo" subtitle="Sincronização com Google/Outlook" />} />
          <Route path="/athena/meeting-links" element={<AthenaPlaceholder title="Gerador de Links" subtitle="Links de reunião instantâneos" />} />
          <Route path="/athena/video" element={<AthenaPlaceholder title="Videoconferência" subtitle="Jitsi Meet com E2E" />} />
          <Route path="/athena/forensics" element={<AthenaPlaceholder title="Perícia Digital" subtitle="Análise forense de evidências" />} />
          <Route path="/athena/phone-interceptions" element={<AthenaInterceptions />} />
          <Route path="/athena/data-interceptions" element={<AthenaInterceptions />} />
          <Route path="/athena/data-extraction" element={<AthenaPlaceholder title="Extração de Dados" subtitle="Cellebrite, UFED, Oxygen" />} />
          <Route path="/athena/erbs" element={<AthenaERBs />} />
          <Route path="/athena/iped" element={<AthenaPlaceholder title="IPED" subtitle="Indexação e processamento forense" />} />
          <Route path="/athena/evidence-processing" element={<AthenaPlaceholder title="Processamento de Evidências" subtitle="Chain of custody completo" />} />
          <Route path="/athena/process-analysis" element={<AthenaPlaceholder title="Análise Processual" subtitle="IA Preditiva para processos" />} />
          <Route path="/athena/reports" element={<AthenaPlaceholder title="Relatórios Avançados" subtitle="PDF com gráficos e análises" />} />
          <Route path="/athena/financial" element={<AthenaPlaceholder title="Gestão Financeira" subtitle="Controle financeiro completo" />} />
          <Route path="/athena/intelligent-dashboards" element={<AthenaPlaceholder title="Dashboards Inteligentes" subtitle="Analytics com IA" />} />
        </Routes>
      </Router>
      <WhatsAppButton />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;