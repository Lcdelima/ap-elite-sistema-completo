import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, HardDrive, Cpu, Database, Zap, Shield } from 'lucide-react';
import { AthenaNavigationBar, AthenaEmptyState } from '../../components/AthenaComponents';

const MobileForensics = () => {
  const [extraction, setExtraction] = useState(null);
  const [loading, setLoading] = useState(false);

  const tools = [
    { name: 'Chimera Tool', type: 'Android/iOS', status: 'ready', icon: '🔧' },
    { name: 'CS Tool', type: 'Multi-platform', status: 'ready', icon: '💻' },
    { name: 'Avengers Box', type: 'MTK/Qualcomm', status: 'ready', icon: '⚡' },
    { name: 'Clone Man', type: 'Chip Reading', status: 'ready', icon: '📱' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <AthenaNavigationBar 
        title="Mobile Forensics"
        subtitle="Extração Forense de Dispositivos Móveis"
        backDestination="/admin/athena"
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Smartphone className="text-cyan-400" size={36} />
          <div>
            <h2 className="text-3xl font-bold text-white">Elite Mobile Extraction</h2>
            <p className="text-neutral-400 mt-1">Sistema profissional de extração forense</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {tools.map((tool, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-cyan-500/50 cursor-pointer"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="text-white font-semibold mb-1">{tool.name}</h3>
              <p className="text-sm text-neutral-400 mb-2">{tool.type}</p>
              <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">READY</span>
            </motion.div>
          ))}
        </div>

        {/* Extraction Panel */}
        <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HardDrive className="text-cyan-400" />
            Nova Extração Forense
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-neutral-400 mb-2 block">Tipo de Dispositivo</label>
              <select className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white">
                <option>Android</option>
                <option>iOS (iPhone)</option>
                <option>Feature Phone</option>
                <option>Tablet</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-neutral-400 mb-2 block">Método de Extração</label>
              <select className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white">
                <option>Lógica (ADB/iTunes)</option>
                <option>Física (JTAG)</option>
                <option>Chip-off</option>
                <option>ISP (In-System Programming)</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-neutral-400 mb-2 block">Número do Caso</label>
            <input type="text" className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white" placeholder="Ex: CASO-2025-001" />
          </div>

          <motion.button
            disabled={loading}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-lg flex items-center justify-center gap-3 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap size={24} />
            Iniciar Extração Forense
          </motion.button>

          <div className="mt-4 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-start gap-3">
              <Shield className="text-cyan-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-white font-medium mb-1">Cadeia de Custódia Automática</p>
                <p className="text-sm text-neutral-400">Todos os dados extraídos serão automaticamente protegidos com hash SHA-256 e registro em blockchain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileForensics;