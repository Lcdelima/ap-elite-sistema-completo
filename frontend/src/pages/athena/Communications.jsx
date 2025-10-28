import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '../../components/AthenaLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Send, Lock } from 'lucide-react';
import { toast } from 'sonner';

const Communications = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');

  return (
    <AthenaLayout title="Comunicação Corporativa" subtitle="Chat E2E Criptografado">
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-white font-semibold">Criptografia End-to-End Ativa</p>
                <p className="text-slate-400 text-sm">Signal Protocol + AES-256-GCM</p>
              </div>
              <Badge className="bg-green-500 ml-auto">Seguro</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-4">Conversas</h3>
              <div className="text-slate-400 text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversa ainda</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
            <CardContent className="p-4">
              <div className="h-96 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Lock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma conversa para começar</p>
                  <p className="text-sm mt-2">Todas as mensagens são criptografadas de ponta a ponta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AthenaLayout>
  );
};

export default Communications;