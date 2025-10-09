import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2, Copy, Video, Clock } from 'lucide-react';
import { toast } from 'sonner';

const MeetingLinks = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMeetings(res.data.meetings);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setMeetings([]);
      setLoading(false);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  return (
    <AthenaLayout title="Gerador de Links" subtitle="Links de Reunião Instantâneos">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Criar Link de Reunião</h3>
                <p className="text-white text-opacity-90">Gere links instantâneos para videoconferências</p>
              </div>
              <Button className="bg-white text-purple-600 hover:bg-gray-100">
                <Video className="h-4 w-4 mr-2" />
                Gerar Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {meetings.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Link2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300">Nenhuma reunião criada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{meeting.title}</h3>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center text-slate-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">{meeting.duration_minutes} min</span>
                        </div>
                        <Badge className="bg-green-500">E2E Ativo</Badge>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg flex items-center justify-between">
                        <code className="text-cyan-400 text-sm">{meeting.meeting_link}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(meeting.meeting_link)}
                          className="ml-2"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default MeetingLinks;