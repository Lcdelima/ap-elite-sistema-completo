import React from 'react';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Lock, Users, Share } from 'lucide-react';

const VideoConference = () => {
  return (
    <AthenaLayout title="Videoconferência" subtitle="Jitsi Meet com E2E Encryption">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Lock className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Jitsi Meet Integrado</h3>
                <p className="text-white text-opacity-90">Criptografia de ponta a ponta ativada</p>
              </div>
              <Badge className="bg-white text-blue-600 ml-auto">E2E Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Video className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">HD Video</h3>
              <p className="text-slate-400 text-sm">Qualidade 1080p</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Múltiplos Participantes</h3>
              <p className="text-slate-400 text-sm">Até 50 pessoas</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Share className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Compartilhamento</h3>
              <p className="text-slate-400 text-sm">Tela e arquivos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AthenaLayout>
  );
};

export default VideoConference;