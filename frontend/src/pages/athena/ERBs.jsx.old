import React, { useState } from 'react';
import AthenaLayout from '@/components/AthenaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HardDrive, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';

const ERBs = () => {
  const [latitude, setLatitude] = useState('-23.550520');
  const [longitude, setLongitude] = useState('-46.633308');
  const [mapUrl, setMapUrl] = useState('');

  const handleSearch = () => {
    const MAPS_KEY = 'AIzaSyDPPT-KaJl0ctGBQPOAYSVaWwu6uZPyAPA';
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=800x600&markers=color:red|${latitude},${longitude}&key=${MAPS_KEY}`;
    setMapUrl(url);
    toast.success('Mapa carregado!');
  };

  return (
    <AthenaLayout title="ERBs - Estações Rádio Base" subtitle="Mapeamento com Google Maps">
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-white font-semibold">Google Maps API Ativa</p>
                <p className="text-slate-400 text-sm">Busque ERBs por localização</p>
              </div>
              <Badge className="bg-green-500 ml-auto">Conectado</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Buscar ERBs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="-23.550520"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="-46.633308"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full btn-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar ERBs
                </Button>
              </div>
            </div>

            {mapUrl && (
              <div className="mt-6">
                <img src={mapUrl} alt="Mapa de ERBs" className="w-full rounded-lg" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <HardDrive className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Vivo</p>
              <p className="text-slate-400 text-sm">4G/5G</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <HardDrive className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Claro</p>
              <p className="text-slate-400 text-sm">4G/5G</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <HardDrive className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-semibold">TIM</p>
              <p className="text-slate-400 text-sm">4G/5G</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 text-center">
              <HardDrive className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Oi</p>
              <p className="text-slate-400 text-sm">3G/4G</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AthenaLayout>
  );
};

export default ERBs;