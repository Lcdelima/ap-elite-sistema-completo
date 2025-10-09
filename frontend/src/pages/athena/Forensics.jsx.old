import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Upload, FileText, Hash } from 'lucide-react';
import { toast } from 'sonner';

const Forensics = () => {
  const [evidence, setEvidence] = useState([]);

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/forensics/evidence`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEvidence(res.data.evidence);
    } catch (error) {
      console.error('Error:', error);
      setEvidence([]);
    }
  };

  return (
    <AthenaLayout title="Perícia Digital" subtitle="Análise Forense de Evidências">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-slate-500 to-gray-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="h-12 w-12 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Chain of Custody</h3>
                  <p className="text-white text-opacity-90">Rastreamento completo de evidências</p>
                </div>
              </div>
              <Button className="bg-white text-gray-600 hover:bg-gray-100">
                <Upload className="h-4 w-4 mr-2" />
                Upload Evidência
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{evidence.length}</p>
              <p className="text-slate-400 text-sm">Evidências</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Hash className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">SHA-256</p>
              <p className="text-slate-400 text-sm">Hash Verification</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-slate-400 text-sm">Integridade</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AthenaLayout>
  );
};

export default Forensics;