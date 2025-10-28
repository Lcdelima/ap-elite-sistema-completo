import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, MapPin, Wifi, Globe, Shield, AlertTriangle, CheckCircle, Database, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const CISAIPlusMain = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geointel');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Estados para formulários
  const [geoForm, setGeoForm] = useState({
    gps: { lat: -22.9068, lon: -43.1729, accuracy: 10 },
    cell: { mcc: 724, mnc: 5, lac: 12345, cid: 67890, ta: 3 },
    wifi: []
  });

  const [ipForm, setIpForm] = useState({ ip: '8.8.8.8' });
  const [wifiForm, setWifiForm] = useState({ bssid: '' });
  const [spoofForm, setSpoofForm] = useState({
    fixes: [
      { lat: -22.9068, lon: -43.1729, timestamp: new Date().toISOString() },
      { lat: -22.9100, lon: -43.1800, timestamp: new Date(Date.now() + 300000).toISOString() }
    ]
  });

  const handleGeoResolve = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cisai/geo/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geoForm)
      });
      
      if (!response.ok) throw new Error('Erro ao resolver localização');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIPIntel = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cisai/net/ip/intel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ipForm)
      });
      
      if (!response.ok) throw new Error('Erro ao analisar IP');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWiFiLookup = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cisai/wifi/lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wifiForm)
      });
      
      if (!response.ok) throw new Error('Erro ao consultar BSSID');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSpoofDetection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cisai/anti/spoof/gps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(spoofForm)
      });
      
      if (!response.ok) throw new Error('Erro na detecção de spoofing');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-cyan-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/athena')}
                className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-cyan-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">CISAI+ | GeoIntel & CyberForense</h1>
                <p className="text-sm text-gray-400">Sistema Avançado de Inteligência Forense</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm">Cadeia de Custódia Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {[
            { id: 'geointel', label: 'GeoIntel Forense', icon: MapPin },
            { id: 'ipintel', label: 'IP Intelligence', icon: Globe },
            { id: 'wifiintel', label: 'Wi-Fi Intel', icon: Wifi },
            { id: 'antiforense', label: 'Antiforense & Spoof', icon: Shield },
            { id: 'osint', label: 'Fontes OSINT', icon: Database }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
                setError(null);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-black/20 text-gray-400 hover:bg-black/40'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Entrada de Dados</span>
            </h2>

            {/* GeoIntel Form */}
            {activeTab === 'geointel' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GPS</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={geoForm.gps.lat}
                      onChange={e => setGeoForm({...geoForm, gps: {...geoForm.gps, lat: parseFloat(e.target.value)}})}
                      className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={geoForm.gps.lon}
                      onChange={e => setGeoForm({...geoForm, gps: {...geoForm.gps, lon: parseFloat(e.target.value)}})}
                      className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ERB (Cell Tower)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="MCC"
                      value={geoForm.cell.mcc}
                      onChange={e => setGeoForm({...geoForm, cell: {...geoForm.cell, mcc: parseInt(e.target.value)}})}
                      className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="number"
                      placeholder="MNC"
                      value={geoForm.cell.mnc}
                      onChange={e => setGeoForm({...geoForm, cell: {...geoForm.cell, mnc: parseInt(e.target.value)}})}
                      className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="number"
                      placeholder="LAC"
                      value={geoForm.cell.lac}
                      onChange={e => setGeoForm({...geoForm, cell: {...geoForm.cell, lac: parseInt(e.target.value)}})}
                      className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="number"
                      placeholder="Cell ID"
                      value={geoForm.cell.cid}
                      onChange={e => setGeoForm({...geoForm, cell: {...geoForm.cell, cid: parseInt(e.target.value)}})}
                      className="bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGeoResolve}
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Resolvendo...' : 'Resolver Localização Multimodal'}
                </button>
              </div>
            )}

            {/* IP Intel Form */}
            {activeTab === 'ipintel' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Endereço IP</label>
                  <input
                    type="text"
                    placeholder="Ex: 8.8.8.8"
                    value={ipForm.ip}
                    onChange={e => setIpForm({ip: e.target.value})}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white"
                  />
                </div>

                <button
                  onClick={handleIPIntel}
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analisando...' : 'Analisar IP Intelligence'}
                </button>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <h3 className="text-blue-400 font-semibold mb-2">Informações Incluídas:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Geolocalização (País, Região, Cidade)</li>
                    <li>• ASN e Organização</li>
                    <li>• Detecção VPN/Proxy/TOR</li>
                    <li>• WHOIS e DNS reverso</li>
                    <li>• Score de risco (0-100)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* WiFi Intel Form */}
            {activeTab === 'wifiintel' && (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span><strong>Integração Ativa:</strong> Wigle API configurada e operacional!</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">BSSID (MAC Address)</label>
                  <input
                    type="text"
                    placeholder="Ex: AA:BB:CC:DD:EE:FF"
                    value={wifiForm.bssid}
                    onChange={e => setWifiForm({bssid: e.target.value})}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white uppercase"
                  />
                  <p className="text-xs text-gray-400 mt-1">Formato: AA:BB:CC:DD:EE:FF (6 pares hexadecimais)</p>
                </div>

                <button
                  onClick={handleWiFiLookup}
                  disabled={loading || !wifiForm.bssid}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Consultando Wigle...' : 'Consultar BSSID no Wigle'}
                </button>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <h3 className="text-blue-400 font-semibold mb-2">Dados Retornados:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• SSID (nome da rede)</li>
                    <li>• Localização (lat/lon)</li>
                    <li>• Primeira e última detecção</li>
                    <li>• Canal e criptografia</li>
                    <li>• Fabricante do AP</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Antiforense Form */}
            {activeTab === 'antiforense' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Pontos GPS para Análise</label>
                  <textarea
                    rows={6}
                    placeholder="Formato JSON: [{'lat': -22.9068, 'lon': -43.1729, 'timestamp': '...'}]"
                    value={JSON.stringify(spoofForm.fixes, null, 2)}
                    onChange={e => {
                      try {
                        setSpoofForm({fixes: JSON.parse(e.target.value)});
                      } catch {}
                    }}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-white font-mono text-sm"
                  />
                </div>

                <button
                  onClick={handleSpoofDetection}
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Detectando...' : 'Detectar Spoofing GPS'}
                </button>

                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h3 className="text-red-400 font-semibold mb-2">Análises Realizadas:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Velocidades impossíveis</li>
                    <li>• Saltos geográficos anômalos</li>
                    <li>• Inconsistências temporais</li>
                    <li>• Padrões de movimento suspeitos</li>
                  </ul>
                </div>
              </div>
            )}

            {/* OSINT Sources */}
            {activeTab === 'osint' && (
              <div className="space-y-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <h3 className="text-purple-400 font-semibold mb-3">Fontes OSINT Disponíveis</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>
                      <strong>Social Media Intelligence:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Twitter/X Advanced Search</li>
                        <li>• Facebook Ads Library</li>
                        <li>• Instagram Location Search</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <strong>Network Intelligence:</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Shodan / Censys</li>
                        <li>• WHOIS Lookup (Integrado)</li>
                        <li>• DNS Intelligence</li>
                      </ul>
                    </div>
                    <div className="mt-3">
                      <strong>Public Records (Brasil):</strong>
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Portal da Transparência</li>
                        <li>• Consulta CNPJ</li>
                        <li>• Dados Abertos Gov</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <a
                  href="https://www.transparencia.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors text-center"
                >
                  Acessar Portal da Transparência
                </a>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Resultados da Análise</span>
            </h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {result ? (
              <div className="space-y-4">
                {/* GeoIntel Result */}
                {activeTab === 'geointel' && result.location && (
                  <div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center space-x-2 text-green-400 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Localização Resolvida</span>
                      </div>
                      <p className="text-white text-lg">
                        {result.location.lat.toFixed(6)}, {result.location.lon.toFixed(6)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Precisão: ±{result.location.accuracy_m.toFixed(0)}m
                      </p>
                      <p className="text-gray-400 text-sm">
                        Fontes: {result.sources.join(', ')}
                      </p>
                    </div>

                    {/* Map */}
                    <div className="h-64 rounded-lg overflow-hidden border border-cyan-500/30">
                      <MapContainer
                        center={[result.location.lat, result.location.lon]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap contributors'
                        />
                        <Marker position={[result.location.lat, result.location.lon]}>
                          <Popup>
                            Localização Resolvida<br />
                            ±{result.location.accuracy_m}m
                          </Popup>
                        </Marker>
                        <Circle
                          center={[result.location.lat, result.location.lon]}
                          radius={result.location.accuracy_m}
                          pathOptions={{ color: 'cyan', fillColor: 'cyan', fillOpacity: 0.2 }}
                        />
                      </MapContainer>
                    </div>

                    <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <p className="text-sm text-gray-300">{result.explain}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Hash de Custódia: {result.custody_chain?.hash}
                      </p>
                    </div>
                  </div>
                )}

                {/* IP Intel Result */}
                {activeTab === 'ipintel' && result.ip && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">País</p>
                        <p className="text-white font-semibold">{result.geolocation?.country || 'N/A'}</p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Cidade</p>
                        <p className="text-white font-semibold">{result.geolocation?.city || 'N/A'}</p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">ISP</p>
                        <p className="text-white font-semibold text-sm">{result.network?.isp || 'N/A'}</p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400">ASN</p>
                        <p className="text-white font-semibold">{result.network?.as || 'N/A'}</p>
                      </div>
                    </div>

                    <div className={`rounded-lg p-4 ${
                      result.security?.risk_score > 50 
                        ? 'bg-red-500/10 border border-red-500/30' 
                        : 'bg-green-500/10 border border-green-500/30'
                    }`}>
                      <p className="text-sm font-semibold mb-2">
                        Score de Risco: {result.security?.risk_score || 0}/100
                      </p>
                      <div className="space-y-1 text-sm">
                        <p>VPN: {result.security?.is_vpn ? '🔴 Sim' : '🟢 Não'}</p>
                        <p>TOR: {result.security?.is_tor ? '🔴 Sim' : '🟢 Não'}</p>
                        <p>Proxy: {result.flags?.is_proxy ? '🔴 Sim' : '🟢 Não'}</p>
                      </div>
                    </div>

                    {/* AbuseIPDB Data */}
                    {result.abuseipdb && !result.abuseipdb.error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <h3 className="text-red-400 font-semibold mb-2 flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>AbuseIPDB Intelligence</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Confidence Score</p>
                            <p className="text-white font-semibold">{result.abuseipdb.abuse_confidence_score}%</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Reports</p>
                            <p className="text-white font-semibold">{result.abuseipdb.total_reports}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Usage Type</p>
                            <p className="text-white font-semibold">{result.abuseipdb.usage_type || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Whitelisted</p>
                            <p className={result.abuseipdb.is_whitelisted ? 'text-green-400' : 'text-gray-400'}>
                              {result.abuseipdb.is_whitelisted ? '✓ Yes' : '✗ No'}
                            </p>
                          </div>
                        </div>
                        {result.abuseipdb.last_reported_at && (
                          <p className="text-xs text-gray-400 mt-2">
                            Último reporte: {new Date(result.abuseipdb.last_reported_at).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    )}

                    {result.geolocation?.lat && result.geolocation?.lon && (
                      <div className="h-48 rounded-lg overflow-hidden border border-cyan-500/30">
                        <MapContainer
                          center={[result.geolocation.lat, result.geolocation.lon]}
                          zoom={10}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[result.geolocation.lat, result.geolocation.lon]}>
                            <Popup>
                              {result.geolocation.city}, {result.geolocation.country}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* WiFi Intel Result */}
                {activeTab === 'wifiintel' && result.bssid && (
                  <div className="space-y-3">
                    {result.error ? (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <AlertTriangle className="w-5 h-5" />
                          <span>{result.error}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <div className="flex items-center space-x-2 text-green-400 mb-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">BSSID Encontrado no Wigle</span>
                          </div>
                          <p className="text-white text-lg font-mono">{result.bssid}</p>
                          <p className="text-gray-400 text-sm">SSID: {result.ssid || 'N/A'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Coordenadas</p>
                            <p className="text-white font-semibold text-sm">
                              {result.lat?.toFixed(6)}, {result.lon?.toFixed(6)}
                            </p>
                          </div>
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Canal</p>
                            <p className="text-white font-semibold">{result.channel || 'N/A'}</p>
                          </div>
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Criptografia</p>
                            <p className="text-white font-semibold text-sm">{result.encryption || 'N/A'}</p>
                          </div>
                          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                            <p className="text-xs text-gray-400">Fabricante</p>
                            <p className="text-white font-semibold text-sm">{result.vendor || 'N/A'}</p>
                          </div>
                        </div>

                        {result.first_seen && (
                          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Timeline</p>
                            <p className="text-sm text-white">
                              Primeira detecção: {new Date(result.first_seen).toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm text-white">
                              Última detecção: {new Date(result.last_seen).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )}

                        {result.lat && result.lon && (
                          <div className="h-64 rounded-lg overflow-hidden border border-cyan-500/30">
                            <MapContainer
                              center={[result.lat, result.lon]}
                              zoom={15}
                              style={{ height: '100%', width: '100%' }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={[result.lat, result.lon]}>
                                <Popup>
                                  {result.ssid}<br />
                                  BSSID: {result.bssid}
                                </Popup>
                              </Marker>
                              <Circle
                                center={[result.lat, result.lon]}
                                radius={50}
                                pathOptions={{ color: 'cyan', fillColor: 'cyan', fillOpacity: 0.2 }}
                              />
                            </MapContainer>
                          </div>
                        )}

                        {result.total_results && (
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-sm text-gray-300">
                              Total de registros no Wigle: <span className="text-white font-semibold">{result.total_results}</span>
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Spoof Detection Result */}
                {activeTab === 'antiforense' && result.score !== undefined && (
                  <div>
                    <div className={`rounded-lg p-4 mb-4 ${
                      result.score > 0.5
                        ? 'bg-red-500/10 border border-red-500'
                        : 'bg-green-500/10 border border-green-500/30'
                    }`}>
                      <h3 className="font-semibold mb-2">
                        Score de Spoofing: {(result.score * 100).toFixed(0)}%
                      </h3>
                      <p className="text-sm">{result.explain}</p>
                    </div>

                    {result.flags && result.flags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-yellow-400">Anomalias Detectadas:</h4>
                        {result.flags.map((flag, idx) => (
                          <div key={idx} className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-sm">
                            <p className="font-semibold">{flag.type}</p>
                            {flag.speed_kmh && <p>Velocidade: {flag.speed_kmh} km/h</p>}
                            <p className="text-xs text-gray-400">Severidade: {flag.severity}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-400 mb-2">Recomendações:</h4>
                        <ul className="text-sm space-y-1">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado ainda</p>
                <p className="text-sm">Preencha o formulário e execute a análise</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 bg-black/40 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-4">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>✅ Conformidade: LGPD, ISO/IEC 27037, 27042</span>
              <span>🔒 Cadeia de Custódia Ativa</span>
              <span>📡 OpenCellID Integrado</span>
            </div>
            <div>
              <span className="text-cyan-400">CISAI+ v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CISAIPlusMain;
