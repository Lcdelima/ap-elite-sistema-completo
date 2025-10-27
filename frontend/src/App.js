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
import DigitalForensicsComplete from './pages/athena/DigitalForensicsComplete';
import ForensicsEnhanced from './pages/athena/ForensicsEnhanced';
import PericiaDigitalPro from './pages/athena/PericiaDigitalPro';
import InterceptacoesTelematicasPro from './pages/athena/InterceptacoesTelematicasPro';
import UltraExtractionPro from './pages/athena/UltraExtractionPro';
import PasswordRecoveryElite from './pages/athena/PasswordRecoveryElite';
import DataRecoveryUltimate from './pages/athena/DataRecoveryUltimate';
import USBForensicsPro from './pages/athena/USBForensicsPro';
import FinancialManagement from './pages/admin/FinancialManagement';
import Communications from './pages/admin/Communications';
import Calendar from './pages/admin/Calendar';
import ReportsExport from './pages/admin/ReportsExport';
import AthenaMain from './pages/admin/AthenaMainReorganized';

// Athena modules
import AthenaDashboard from './pages/athena/Dashboard';
import AthenaClients from './pages/athena/Clients';
import AthenaClientsEnhanced from './pages/athena/ClientsEnhanced';
import AthenaProcesses from './pages/athena/ProcessesStandardized';
import AthenaCommunications from './pages/athena/Communications';
import AthenaCommunicationsEnhanced from './pages/athena/CommunicationsEnhanced';
import AthenaCalendar from './pages/athena/Calendar';
import AthenaMeetingLinks from './pages/athena/MeetingLinks';
import AthenaVideoConference from './pages/athena/VideoConference';
import AthenaForensics from './pages/athena/Forensics';
import DataExtractionEnhanced from './pages/athena/DataExtractionEnhanced';
import EvidenceProcessingEnhanced from './pages/athena/EvidenceProcessingEnhanced';
import AthenaPhoneInterceptions from './pages/athena/PhoneInterceptionsComplete';
import AthenaPhoneInterceptionsPro from './pages/athena/PhoneInterceptionsPro';
import AthenaDataInterceptions from './pages/athena/DataInterceptions';
import AthenaDataExtraction from './pages/athena/DataExtraction';
import AthenaERBs from './pages/athena/ERBs';
import AthenaIPED from './pages/athena/IPED';
import AthenaEvidenceProcessing from './pages/athena/EvidenceProcessing';
import AthenaProcessAnalysis from './pages/athena/ProcessAnalysisComplete';
import ProcessAnalysisPro from './pages/athena/ProcessAnalysisPro';
import AthenaReports from './pages/athena/Reports';
import AthenaFinancial from './pages/athena/FinancialManagementEnhanced';
import AthenaIntelligentDashboards from './pages/athena/IntelligentDashboards';
import AthenaContractGenerator from './pages/athena/ContractGeneratorComplete';
import AthenaEvidenceAnalysis from './pages/athena/EvidenceAnalysis';
import AthenaDocumentGenerator from './pages/athena/DocumentGeneratorComplete';
import DocumentLibraryComplete from './pages/athena/DocumentLibraryComplete';
import AutomatedReportsComplete from './pages/athena/AutomatedReportsComplete';
import AthenaDefensiveInvestigation from './pages/athena/DefensiveInvestigation';
import AthenaUserManagement from './pages/athena/UserManagement';
import AthenaUnifiedDashboard from './pages/athena/UnifiedDashboard';
import AdvancedInvestigation from './pages/athena/AdvancedInvestigationComplete';
import RelationshipMapping from './pages/athena/RelationshipMapping';
import DocumentLibrary from './pages/athena/DocumentLibrary';
import OSINTDashboard from './pages/athena/OSINTDashboard';
import TemplateGenerator from './pages/athena/TemplateGenerator';
import RAGSystem from './pages/athena/RAGSystem';
import ExecutiveDashboard from './pages/athena/ExecutiveDashboardPro';
import DeadlineManager from './pages/athena/DeadlineManager';
import BlockchainCustody from './pages/athena/BlockchainCustody';
import SmartFees from './pages/athena/SmartFees';
import GlobalSearch from './pages/athena/GlobalSearch';
import OCRDashboard from './pages/athena/OCRDashboard';
import MediaAnalysis from './pages/athena/MediaAnalysis';
import WorkflowManager from './pages/athena/WorkflowManager';
import ChatbotInterface from './pages/athena/ChatbotInterface';
import SocialMonitor from './pages/athena/SocialMonitor';
import CollaborationHub from './pages/athena/CollaborationHub';
import PredictiveAnalytics from './pages/athena/PredictiveAnalytics';
import ComplianceCenter from './pages/athena/ComplianceCenter';

// Import components
import WhatsAppButton from './components/WhatsAppButton';
import HybridNotifications from './components/HybridNotifications';

function AppContent() {
  useKeyboardShortcuts();
  
  return (
    <div className="App min-h-screen bg-slate-50 dark:bg-slate-900">
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
          <Route path="/athena/digital-forensics" element={<DigitalForensicsComplete />} />
          <Route path="/admin/financial" element={<FinancialManagement />} />
          <Route path="/admin/communications" element={<Communications />} />
          <Route path="/admin/calendar" element={<Calendar />} />
          <Route path="/admin/reports" element={<ReportsExport />} />
          <Route path="/athena" element={<AthenaMain />} />
          <Route path="/admin/athena" element={<AthenaMain />} />
          
          {/* Athena Module Routes - All 18 Modules */}
          <Route path="/athena/dashboard" element={<AthenaDashboard />} />
          <Route path="/athena/clients" element={<AthenaClientsEnhanced />} />
          <Route path="/athena/processes" element={<AthenaProcesses />} />
          <Route path="/athena/communications" element={<AthenaCommunicationsEnhanced />} />
          <Route path="/athena/calendar" element={<AthenaCalendar />} />
          <Route path="/athena/meeting-links" element={<AthenaMeetingLinks />} />
          <Route path="/athena/video" element={<AthenaVideoConference />} />
          <Route path="/athena/forensics" element={<AthenaForensics />} />
          <Route path="/athena/forensics-enhanced" element={<ForensicsEnhanced />} />
          <Route path="/athena/pericia-digital-pro" element={<PericiaDigitalPro />} />
          <Route path="/athena/interceptacoes-telematicas-pro" element={<InterceptacoesTelematicasPro />} />
          <Route path="/athena/ultra-extraction-pro" element={<UltraExtractionPro />} />
          <Route path="/athena/password-recovery-elite" element={<PasswordRecoveryElite />} />
          <Route path="/athena/data-extraction" element={<AthenaDataExtraction />} />
          <Route path="/athena/data-extraction-enhanced" element={<DataExtractionEnhanced />} />
          <Route path="/athena/evidence-processing" element={<AthenaEvidenceProcessing />} />
          <Route path="/athena/evidence-processing-enhanced" element={<EvidenceProcessingEnhanced />} />
          <Route path="/athena/phone-interceptions" element={<AthenaPhoneInterceptions />} />
          <Route path="/athena/phone-interceptions-pro" element={<AthenaPhoneInterceptionsPro />} />
          <Route path="/athena/data-interceptions" element={<AthenaDataInterceptions />} />
          <Route path="/athena/data-extraction" element={<AthenaDataExtraction />} />
          <Route path="/athena/erbs" element={<AthenaERBs />} />
          <Route path="/athena/iped" element={<AthenaIPED />} />
          <Route path="/athena/evidence-processing" element={<AthenaEvidenceProcessing />} />
          <Route path="/athena/process-analysis" element={<AthenaProcessAnalysis />} />
          <Route path="/athena/process-analysis-pro" element={<ProcessAnalysisPro />} />
          <Route path="/athena/reports" element={<AthenaReports />} />
          <Route path="/athena/financial" element={<AthenaFinancial />} />
          <Route path="/athena/intelligent-dashboards" element={<AthenaIntelligentDashboards />} />
          <Route path="/athena/contracts" element={<AthenaContractGenerator />} />
          <Route path="/athena/evidence-analysis" element={<AthenaEvidenceAnalysis />} />
          <Route path="/athena/documents" element={<AthenaDocumentGenerator />} />
          <Route path="/athena/defensive-investigation" element={<AthenaDefensiveInvestigation />} />
          <Route path="/athena/user-management" element={<AthenaUserManagement />} />
          <Route path="/athena/unified-dashboard" element={<AthenaUnifiedDashboard />} />
          <Route path="/athena/advanced-investigation" element={<AdvancedInvestigation />} />
          <Route path="/athena/relationship-mapping" element={<RelationshipMapping />} />
          <Route path="/athena/document-library" element={<DocumentLibraryComplete />} />
          <Route path="/athena/osint-dashboard" element={<OSINTDashboard />} />
          <Route path="/athena/template-generator" element={<TemplateGenerator />} />
          <Route path="/athena/rag-system" element={<RAGSystem />} />
          <Route path="/athena/executive-dashboard" element={<ExecutiveDashboard />} />
          <Route path="/athena/blockchain-custody" element={<BlockchainCustody />} />
          <Route path="/athena/smart-fees" element={<SmartFees />} />
          <Route path="/athena/global-search" element={<GlobalSearch />} />
          <Route path="/athena/ocr-dashboard" element={<OCRDashboard />} />
          <Route path="/athena/media-analysis" element={<MediaAnalysis />} />
          <Route path="/athena/workflow-manager" element={<WorkflowManager />} />
          <Route path="/athena/chatbot" element={<ChatbotInterface />} />
          <Route path="/athena/social-monitor" element={<SocialMonitor />} />
          <Route path="/athena/collaboration" element={<CollaborationHub />} />
          <Route path="/athena/predictive-analytics" element={<PredictiveAnalytics />} />
          <Route path="/athena/compliance" element={<ComplianceCenter />} />
          <Route path="/athena/deadlines" element={<DeadlineManager />} />
          <Route path="/athena/automated-reports" element={<AutomatedReportsComplete />} />
      </Routes>
      <WhatsAppButton />
      <HybridNotifications />
      <KeyboardShortcutsModal />
      <Toaster position="top-right" richColors />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TourProvider>
        <Router>
          <AppContent />
        </Router>
      </TourProvider>
    </ThemeProvider>
  );
}

export default App;