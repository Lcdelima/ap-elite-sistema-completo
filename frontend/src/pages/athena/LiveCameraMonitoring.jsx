import React, { useState, useEffect } from 'react';
import { Camera, Video, MapPin, AlertTriangle, CheckCircle, RefreshCw, Eye, Navigation, TrendingUp, Activity } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

// Câmeras públicas do Rio de Janeiro (exemplo)
const PUBLIC_CAMERAS = [
  {
    id: 1,
    name: 'Av. Brasil - Penha',
    location: { lat: -22.8456, lon: -43.2822 },
    status: 'online',
    type: 'traffic',
    stream: 'http://cameras.rio.rj.gov.br/stream1',
    thumbnail: 'https://via.placeholder.com/320x180/1a1a2e/00d4ff?text=Av.+Brasil'
  },
  {
    id: 2,
    name: 'Linha Vermelha - Norte',
    location: { lat: -22.8823, lon: -43.2851 },
    status: 'online',
    type: 'traffic',
    stream: 'http://cameras.rio.rj.gov.br/stream2',
    thumbnail: 'https://via.placeholder.com/320x180/1a1a2e/00d4ff?text=Linha+Vermelha'
  },
  {
    id: 3,
    name: 'Copacabana - Posto 6',
    location: { lat: -22.9868, lon: -43.1890 },
    status: 'online',
    type: 'security',
    stream: 'http://cameras.rio.rj.gov.br/stream3',
    thumbnail: 'https://via.placeholder.com/320x180/1a1a2e/00d4ff?text=Copacabana'
  },
  {
    id: 4,
    name: 'Centro - Praça XV',
    location: { lat: -22.9035, lon: -43.1745 },
    status: 'online',
    type: 'security',
    stream: 'http://cameras.rio.rj.gov.br/stream4',
    thumbnail: 'https://via.placeholder.com/320x180/1a1a2e/00d4ff?text=Centro'
  },
  {
    id: 5,
    name: 'Barra da Tijuca - Av. das Américas',
    location: { lat: -23.0045, lon: -43.3647 },
    status: 'online',
    type: 'traffic',
    stream: 'http://cameras.rio.rj.gov.br/stream5',
    thumbnail: 'https://via.placeholder.com/320x180/1a1a2e/00d4ff?text=Barra'
  },
  {
    id: 6,
    name: 'Túnel Rebouças',
    location: { lat: -22.9483, lon: -43.1893 },
    status: 'maintenance',
    type: 'traffic',
    stream: null,
    thumbnail: 'https://via.placeholder.com/320x180/4a4a4a/ff0000?text=Manutenção'
  }
];

// Dados de tráfego simulados (em produção viria de API)
const TRAFFIC_DATA = [
  { id: 1, road: 'Av. Brasil', level: 'heavy', speed: 15, incidents: 2 },
  { id: 2, road: 'Linha Vermelha', level: 'moderate', speed: 45, incidents: 0 },
  { id: 3, road: 'Linha Amarela', level: 'light', speed: 70, incidents: 0 },
  { id: 4, road: 'Túnel Rebouças', level: 'heavy', speed: 10, incidents: 1 },
  { id: 5, road: 'Av. das Américas', level: 'moderate', speed: 40, incidents: 1 }
];

const LiveCameraMonitoring = () => {
  const [cameras, setCameras] = useState(PUBLIC_CAMERAS);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [trafficData, setTrafficData] = useState(TRAFFIC_DATA);
  const [filterType, setFilterType] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [mapCenter] = useState([-22.9068, -43.1729]); // Rio de Janeiro

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshCameras();
        refreshTrafficData();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const refreshCameras = async () => {
    try {
      // Em produção, fazer request para API real
      // const response = await axios.get(`${BACKEND_URL}/api/athena/cameras/status`);
      // setCameras(response.data.data);
      
      // Simular atualização de status
      setCameras(prev => prev.map(cam => ({
        ...cam,
        status: Math.random() > 0.1 ? 'online' : 'offline'
      })));
      
      toast.success('Câmeras atualizadas');
    } catch (error) {
      console.error('Erro ao atualizar câmeras:', error);
    }
  };

  const refreshTrafficData = async () => {
    try {
      // Em produção, integrar com API de tráfego
      // const response = await axios.get('https://api.tomtom.com/traffic/...');
      
      // Simular atualização de tráfego
      setTrafficData(prev => prev.map(traffic => ({
        ...traffic,
        speed: Math.floor(Math.random() * 80) + 10,
        level: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)]
      })));
    } catch (error) {
      console.error('Erro ao atualizar tráfego:', error);
    }
  };

  const filteredCameras = filterType === 'all' 
    ? cameras 
    : cameras.filter(cam => cam.type === filterType);

  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const offlineCameras = cameras.filter(c => c.status === 'offline').length;

  const getTrafficColor = (level) => {
    switch(level) {
      case 'light': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'heavy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrafficLevelText = (level) => {
    switch(level) {
      case 'light': return 'Leve';
      case 'moderate': return 'Moderado';
      case 'heavy': return 'Intenso';
      default: return 'Desconhecido';
    }
  };

  return (
    <UniversalModuleLayout
      title=\"Monitoramento de Câmeras e Tráfego\"
      subtitle=\"Sistema integrado de vigilância em tempo real com análise de tráfego\"
      icon={Camera}
      headerAction={
        <div className=\"flex items-center gap-3\">
          <div className=\"flex items-center gap-2 bg-white px-4 py-2 rounded-lg\">
            <Activity className={`w-5 h-5 ${autoRefresh ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
            <span className=\"text-sm font-medium\">{autoRefresh ? 'Auto-refresh: ON' : 'Auto-refresh: OFF'}</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className=\"ml-2 px-2 py-1 text-xs bg-teal-500 text-white rounded hover:bg-teal-600\"
            >
              {autoRefresh ? 'Pausar' : 'Ativar'}
            </button>
          </div>
          <button
            onClick={() => {
              refreshCameras();
              refreshTrafficData();
            }}
            className=\"bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2\"
          >
            <RefreshCw className=\"w-5 h-5\" />
            Atualizar
          </button>
        </div>
      }
    >
      {/* Stats */}
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4 mb-6\">
        <div className=\"bg-white p-6 rounded-lg shadow\">
          <div className=\"flex items-center justify-between mb-2\">
            <p className=\"text-sm text-gray-600\">Câmeras Online</p>
            <CheckCircle className=\"w-5 h-5 text-green-500\" />
          </div>
          <p className=\"text-3xl font-bold text-green-600\">{onlineCameras}</p>
        </div>
        <div className=\"bg-white p-6 rounded-lg shadow\">
          <div className=\"flex items-center justify-between mb-2\">
            <p className=\"text-sm text-gray-600\">Câmeras Offline</p>
            <AlertTriangle className=\"w-5 h-5 text-red-500\" />
          </div>
          <p className=\"text-3xl font-bold text-red-600\">{offlineCameras}</p>
        </div>
        <div className=\"bg-white p-6 rounded-lg shadow\">
          <div className=\"flex items-center justify-between mb-2\">
            <p className=\"text-sm text-gray-600\">Tráfego Intenso</p>
            <TrendingUp className=\"w-5 h-5 text-red-500\" />
          </div>
          <p className=\"text-3xl font-bold text-red-600\">
            {trafficData.filter(t => t.level === 'heavy').length}
          </p>
        </div>
        <div className=\"bg-white p-6 rounded-lg shadow\">
          <div className=\"flex items-center justify-between mb-2\">
            <p className=\"text-sm text-gray-600\">Incidentes Ativos</p>
            <AlertTriangle className=\"w-5 h-5 text-orange-500\" />
          </div>
          <p className=\"text-3xl font-bold text-orange-600\">
            {trafficData.reduce((sum, t) => sum + t.incidents, 0)}
          </p>
        </div>
      </div>

      <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">
        {/* Map View */}
        <div className=\"lg:col-span-2 bg-white rounded-lg shadow p-4\">
          <div className=\"flex items-center justify-between mb-4\">
            <h2 className=\"text-xl font-bold text-gray-900\">Mapa de Câmeras</h2>
            <div className=\"flex gap-2\">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded text-sm ${filterType === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('traffic')}
                className={`px-3 py-1 rounded text-sm ${filterType === 'traffic' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}
              >
                Tráfego
              </button>
              <button
                onClick={() => setFilterType('security')}
                className={`px-3 py-1 rounded text-sm ${filterType === 'security' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}
              >
                Segurança
              </button>
            </div>
          </div>

          <div className=\"h-96 rounded-lg overflow-hidden border border-gray-200\">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url=\"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"
                attribution='&copy; OpenStreetMap contributors'
              />
              {filteredCameras.map((camera) => (
                <Marker
                  key={camera.id}
                  position={[camera.location.lat, camera.location.lon]}
                  eventHandlers={{
                    click: () => setSelectedCamera(camera)
                  }}
                >
                  <Popup>
                    <div className=\"text-sm\">
                      <p className=\"font-bold\">{camera.name}</p>
                      <p className=\"text-xs text-gray-600\">Tipo: {camera.type}</p>
                      <p className={`text-xs ${camera.status === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                        Status: {camera.status}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Camera Feed */}
        <div className=\"bg-white rounded-lg shadow p-4\">
          <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Visualização ao Vivo</h2>
          
          {selectedCamera ? (
            <div className=\"space-y-4\">
              <div className=\"bg-gray-900 rounded-lg overflow-hidden\">
                <img 
                  src={selectedCamera.thumbnail} 
                  alt={selectedCamera.name}
                  className=\"w-full h-48 object-cover\"
                />
                <div className=\"absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1\">
                  <div className=\"w-2 h-2 bg-white rounded-full animate-pulse\"></div>
                  AO VIVO
                </div>
              </div>
              
              <div>
                <h3 className=\"font-bold text-lg\">{selectedCamera.name}</h3>
                <div className=\"flex items-center gap-2 mt-2\">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedCamera.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedCamera.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                  <span className=\"px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700\">
                    {selectedCamera.type === 'traffic' ? 'Tráfego' : 'Segurança'}
                  </span>
                </div>
                
                <div className=\"mt-4 space-y-2\">
                  <button className=\"w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center justify-center gap-2\">
                    <Eye className=\"w-4 h-4\" />
                    Visualização Completa
                  </button>
                  <button className=\"w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2\">
                    <Video className=\"w-4 h-4\" />
                    Gravar Clipe
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className=\"text-center py-12\">
              <Camera className=\"w-16 h-16 text-gray-400 mx-auto mb-4\" />
              <p className=\"text-gray-600\">Selecione uma câmera no mapa</p>
            </div>
          )}
        </div>
      </div>

      {/* Traffic Data */}
      <div className=\"mt-6 bg-white rounded-lg shadow p-6\">
        <h2 className=\"text-xl font-bold text-gray-900 mb-4 flex items-center gap-2\">
          <Navigation className=\"w-6 h-6\" />
          Condições de Tráfego em Tempo Real
        </h2>
        
        <div className=\"space-y-3\">
          {trafficData.map((traffic) => (
            <div key={traffic.id} className=\"flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 transition-colors\">
              <div className=\"flex items-center gap-4\">
                <div className={`w-3 h-3 rounded-full ${
                  traffic.level === 'light' ? 'bg-green-500' :
                  traffic.level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                } animate-pulse`}></div>
                <div>
                  <h3 className=\"font-semibold text-gray-900\">{traffic.road}</h3>
                  <p className=\"text-sm text-gray-600\">Velocidade média: {traffic.speed} km/h</p>
                </div>
              </div>
              
              <div className=\"flex items-center gap-4\">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTrafficColor(traffic.level)}`}>
                  {getTrafficLevelText(traffic.level)}
                </span>
                {traffic.incidents > 0 && (
                  <span className=\"px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700\">
                    {traffic.incidents} Incidente{traffic.incidents > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Camera List */}
      <div className=\"mt-6 bg-white rounded-lg shadow p-6\">
        <h2 className=\"text-xl font-bold text-gray-900 mb-4\">Lista de Câmeras</h2>
        
        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
          {filteredCameras.map((camera) => (
            <div 
              key={camera.id}
              onClick={() => setSelectedCamera(camera)}
              className=\"border border-gray-200 rounded-lg p-3 hover:border-teal-500 cursor-pointer transition-colors\"
            >
              <div className=\"relative\">
                <img 
                  src={camera.thumbnail}
                  alt={camera.name}
                  className=\"w-full h-32 object-cover rounded\"
                />
                {camera.status === 'online' && (
                  <div className=\"absolute top-2 right-2 bg-green-500 w-3 h-3 rounded-full\"></div>
                )}
              </div>
              <h3 className=\"font-semibold mt-2\">{camera.name}</h3>
              <p className=\"text-xs text-gray-600\">{camera.type === 'traffic' ? 'Tráfego' : 'Segurança'}</p>
            </div>
          ))}
        </div>
      </div>
    </UniversalModuleLayout>
  );
};

export default LiveCameraMonitoring;
