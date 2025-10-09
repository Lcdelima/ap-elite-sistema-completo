import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import { ThemeProvider } from './context/ThemeContext';
import { TourProvider } from './context/TourContext';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

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
import AthenaClientsEnhanced from './pages/athena/ClientsEnhanced';
import AthenaProcesses from './pages/athena/Processes';
import AthenaCommunications from './pages/athena/Communications';
import AthenaCommunicationsEnhanced from './pages/athena/CommunicationsEnhanced';
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
import AthenaContractGenerator from './pages/athena/ContractGenerator';
import AthenaEvidenceAnalysis from './pages/athena/EvidenceAnalysis';
import AthenaDocumentGenerator from './pages/athena/DocumentGenerator';
import AthenaDefensiveInvestigation from './pages/athena/DefensiveInvestigation';
import AthenaUserManagement from './pages/athena/UserManagement';
import AthenaUnifiedDashboard from './pages/athena/UnifiedDashboard';

// Import components
import WhatsAppButton from './components/WhatsAppButton';

function AppContent() {
  useKeyboardShortcuts();
  
  return (
    <>
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
          
          {/* Athena Module Routes - All 18 Modules */}
          <Route path="/athena/dashboard" element={<AthenaDashboard />} />
          <Route path="/athena/clients" element={<AthenaClientsEnhanced />} />
          <Route path="/athena/processes" element={<AthenaProcesses />} />
          <Route path="/athena/communications" element={<AthenaCommunicationsEnhanced />} />
          <Route path="/athena/calendar" element={<AthenaCalendar />} />
          <Route path="/athena/meeting-links" element={<AthenaMeetingLinks />} />
          <Route path="/athena/video" element={<AthenaVideoConference />} />
          <Route path="/athena/forensics" element={<AthenaForensics />} />
          <Route path="/athena/phone-interceptions" element={<AthenaPhoneInterceptions />} />
          <Route path="/athena/data-interceptions" element={<AthenaDataInterceptions />} />
          <Route path="/athena/data-extraction" element={<AthenaDataExtraction />} />
          <Route path="/athena/erbs" element={<AthenaERBs />} />
          <Route path="/athena/iped" element={<AthenaIPED />} />
          <Route path="/athena/evidence-processing" element={<AthenaEvidenceProcessing />} />
          <Route path="/athena/process-analysis" element={<AthenaProcessAnalysis />} />
          <Route path="/athena/reports" element={<AthenaReports />} />
          <Route path="/athena/financial" element={<AthenaFinancial />} />
          <Route path="/athena/intelligent-dashboards" element={<AthenaIntelligentDashboards />} />
          <Route path="/athena/contracts" element={<AthenaContractGenerator />} />
          <Route path="/athena/evidence-analysis" element={<AthenaEvidenceAnalysis />} />
          <Route path="/athena/documents" element={<AthenaDocumentGenerator />} />
          <Route path="/athena/defensive-investigation" element={<AthenaDefensiveInvestigation />} />
          <Route path="/athena/user-management" element={<AthenaUserManagement />} />
          <Route path="/athena/unified-dashboard" element={<AthenaUnifiedDashboard />} />
      </Routes>
      <WhatsAppButton />
      <KeyboardShortcutsModal />
      <Toaster position="top-right" richColors />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TourProvider>
        <div className="App min-h-screen bg-slate-50 dark:bg-slate-900">
          <Router>
            <AppContent />
          </Router>
        </div>
      </TourProvider>
    </ThemeProvider>
  );
}

export default App;