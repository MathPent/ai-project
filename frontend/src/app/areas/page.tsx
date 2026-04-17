"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

// Safely lazy load the actual Map to avoid Leaflet SSR window errors
const MapWrapper = dynamic(() => import('./MapWrapper'), { ssr: false });

export interface AreaData {
  analysis_id?: string;
  name?: string;
  coordinates: [number, number][];
  ndvi?: number;
  ndwi?: number;
  temperature?: number;
  rainfall?: number;
  timestamp?: string;
  isNew?: boolean;
}

interface Metadata {
  ndvi: string;
  ndwi: string;
  temperature: string;
  rainfall: string;
}

interface AnalysisResult {
  ndvi?: number;
  ndwi?: number;
  temperature?: number;
  rainfall?: number;
  metadata?: Metadata;
}

export default function AreaInsights() {
  const [selectedArea, setSelectedArea] = useState<AreaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [customPoints, setCustomPoints] = useState<[number, number][]>([]); // Array of [lng, lat]
  const [customName, setCustomName] = useState("");
  const [history, setHistory] = useState<AreaData[]>([]);
  
  // States for text-based geometry insertion
  const [isPasting, setIsPasting] = useState(false);
  const [rawGeoJSON, setRawGeoJSON] = useState("");

  useEffect(() => {
    fetchHistory();
    
    async function fetchHistory() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:4000/areas/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    }
  }, []);

  const handleSelectArea = (area: AreaData) => {
    let parsedCoordinates: [number, number][] = Array.isArray(area.coordinates)
      ? area.coordinates
      : [];
    if (typeof area.coordinates === 'string') {
      try { parsedCoordinates = JSON.parse(area.coordinates); } catch { }
    }
    
    setSelectedArea({ ...area, coordinates: parsedCoordinates });
    setResults(area.ndvi != null ? {
      ndvi: area.ndvi, ndwi: area.ndwi, temperature: area.temperature, rainfall: area.rainfall
    } : null);
    setIsDrawing(false);
    setIsPasting(false);
    setCustomPoints([]);
  };

  const toggleDrawingMode = () => {
    setIsDrawing(!isDrawing);
    setIsPasting(false);
    if (!isDrawing) {
      setSelectedArea(null);
      setCustomPoints([]);
      setResults(null);
    }
  };

  const togglePastingMode = () => {
    setIsPasting(!isPasting);
    setIsDrawing(false);
    if (!isPasting) {
      setSelectedArea(null);
      setCustomPoints([]);
      setResults(null);
    }
  };

  const handleMapClick = (lngLat: [number, number]) => {
    if (!isDrawing) return;
    setCustomPoints(prev => [...prev, lngLat]);
  };

  const finishDrawing = () => {
    if (customPoints.length < 3) {
      setError("Please select at least 3 points for a valid polygon.");
      return;
    }
    if (!customName.trim()) {
      setError("Please provide a name for this area.");
      return;
    }
    // Close the loop
    const polygon = [...customPoints, customPoints[0]];
    setSelectedArea({ name: customName, coordinates: polygon, isNew: true });
    setIsDrawing(false);
    setError("");
  };

  const clearDrawing = () => {
    setCustomPoints([]);
    setCustomName("");
    setRawGeoJSON("");
    setSelectedArea(null);
  };

  const submitRawCoordinates = () => {
    try {
      let parsed = JSON.parse(rawGeoJSON);
      
      // Auto-extract from GeoJSON structures if user pastes a full feature chunk
      if (parsed.type === "FeatureCollection") parsed = parsed.features[0].geometry.coordinates[0];
      else if (parsed.type === "Feature") parsed = parsed.geometry.coordinates[0];
      else if (parsed.type === "Polygon") parsed = parsed.coordinates[0];
      
      if (!Array.isArray(parsed) || parsed.length < 3) throw new Error("Need an array of valid coordinate points");
      if (!customName.trim()) { setError("Please provide a name for this area."); return; }
      
      setSelectedArea({ name: customName, coordinates: parsed, isNew: true });
      setCustomPoints(parsed); // Sync mapped poly dynamically
      setIsPasting(false);
      setError("");
    } catch {
      setError("Invalid Array/JSON geometry format. Format expects [ [lng, lat], ... ]");
    }
  };

  const analyzeArea = async () => {
    if (!selectedArea) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('token');
      
      const res = await axios.post('http://localhost:4000/areas/analyze', {
        name: selectedArea.name,
        coordinates: selectedArea.coordinates
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
      if (selectedArea.isNew) {
         setHistory(prev => [res.data, ...prev]);
         setSelectedArea(res.data);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      if (axiosErr.response?.data?.error) {
         setError(axiosErr.response.data.error + " (Mocking values for demo)");
      } else {
         setError("Failed to connect to backend server. Ensure it's running.");
      }
      setResults({ ndvi: 0.72, ndwi: 0.35, temperature: 26.3, rainfall: 145 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6 pt-4">
      <h1 className="text-4xl font-extrabold heading-gradient">Area Insights</h1>
      <p className="text-slate-300">Select a region or draw your own custom polygon to analyze vegetation health and climate indices via Google Earth Engine.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full pb-8">
        {/* Sidebar */}
        <div className="glass-panel p-6 flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-xl font-bold">Geometry Controls</h2>
          
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <h3 className="font-semibold text-agrigreen-400 mb-2">Draw or Input Custom Area</h3>
            <p className="text-xs text-slate-400 mb-3">Click on the map or directly paste raw coordinates to trace your boundaries.</p>
            {isDrawing ? (
              <div className="flex flex-col gap-3">
                <input type="text" autoFocus placeholder="Enter Area Name (e.g. North Field)" value={customName} onChange={(e) => setCustomName(e.target.value)} className="bg-slate-900 border border-slate-700 text-sm px-3 py-2 rounded focus:outline-none focus:border-agrigreen-500" />
                <button onClick={finishDrawing} className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition text-sm">Save & Analyze</button>
                <button onClick={toggleDrawingMode} className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded font-bold transition text-sm text-slate-300">Cancel Drawing</button>
                <span className="text-xs text-center text-slate-400 mt-1">{customPoints.length} points plotted</span>
              </div>
            ) : isPasting ? (
              <div className="flex flex-col gap-3">
                <input type="text" autoFocus placeholder="Enter Area Name" value={customName} onChange={(e) => setCustomName(e.target.value)} className="bg-slate-900 border border-slate-700 text-sm px-3 py-2 rounded focus:outline-none focus:border-agrigreen-500" />
                <textarea rows={4} placeholder="Paste JSON / Poly Array here e.g. [[78.5, 23.1], ...]" value={rawGeoJSON} onChange={(e) => setRawGeoJSON(e.target.value)} className="bg-slate-900 border border-slate-700 text-xs font-mono px-3 py-2 rounded focus:outline-none focus:border-agrigreen-500 text-slate-300"></textarea>
                <button onClick={submitRawCoordinates} className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition text-sm">Save & Extract Array</button>
                <button onClick={togglePastingMode} className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded font-bold transition text-sm text-slate-300">Cancel Input</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button onClick={toggleDrawingMode} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-bold transition text-sm border border-slate-600">🖋️ Draw</button>
                  <button onClick={togglePastingMode} className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded font-bold transition text-sm border border-slate-600">⌨️ Paste Arrays</button>
                </div>
                {customPoints.length > 0 && selectedArea?.isNew && (
                   <button onClick={clearDrawing} className="bg-red-600/80 hover:bg-red-500 py-2 px-3 w-full mt-2 rounded font-bold transition text-sm">Clear Map Geometry</button>
                )}
              </div>
            )}
          </div>

          <h3 className="text-slate-400 font-semibold uppercase text-xs tracking-wider">Saved Areas</h3>
          {history.length > 0 ? (
            history.map((area: AreaData) => (
              <button
                key={area.analysis_id}
                onClick={() => handleSelectArea(area)}
                className={`p-3 rounded-lg text-left transition text-sm border border-transparent ${selectedArea?.analysis_id === area.analysis_id ? 'bg-agrigreen-600 text-white font-semibold shadow-md shadow-agrigreen-900' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}
              >
                <div className="font-bold">{area.name || 'Unnamed Area'}</div>
                <div className="text-[10px] text-slate-400 mt-1">{area.timestamp ? new Date(area.timestamp).toLocaleDateString() : ''}</div>
              </button>
            ))
          ) : (
             <div className="text-sm text-slate-500 italic p-3 border border-dashed border-slate-700 rounded-lg text-center">
               No areas saved yet. Draw a polygon to analyze and save!
             </div>
          )}

          <button 
            disabled={!selectedArea || loading}
            onClick={analyzeArea}
            className="mt-6 py-4 bg-gradient-to-r from-agrigreen-600 to-blue-600 hover:scale-[1.02] rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-black/20"
          >
            {loading ? 'Analyzing Earth Engine...' : 'Run GEE Analysis'}
          </button>
        </div>

        {/* Map & Results */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="glass-panel h-[45vh] overflow-hidden relative border border-slate-700 z-0 rounded-2xl shadow-xl">
             <MapWrapper 
                selectedArea={selectedArea} 
                isDrawing={isDrawing} 
                customPoints={customPoints}
                onMapClick={handleMapClick}
             />
             
             {/* Map Overlay HUD */}
             {isDrawing && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full z-[1000] text-sm pointer-events-none backdrop-blur-sm border border-slate-700 shadow-xl">
                 Click locations on the map to define your polygon boundaries
               </div>
             )}
          </div>

          {/* Results Area */}
          <div className="glass-panel p-6 flex-1 border border-slate-700 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4">GEE Sentinels Analysis</h2>
            {error && <div className="text-yellow-100 bg-yellow-600/30 border border-yellow-500/50 p-3 rounded mb-4 text-sm">{error}</div>}
            
            {results ? (
              <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                    <div className="text-4xl font-extrabold text-agrigreen-400 mb-2 drop-shadow-md">{results.ndvi?.toFixed(2) || 'N/A'}</div>
                    <div className="text-sm text-slate-400 font-semibold tracking-wide uppercase text-center">{results.metadata ? 'Real NDVI' : 'Mean NDVI'}</div>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                    <div className="text-4xl font-extrabold text-blue-400 mb-2 drop-shadow-md">{results.ndwi?.toFixed(2) || 'N/A'}</div>
                    <div className="text-sm text-slate-400 font-semibold tracking-wide uppercase text-center">{results.metadata ? 'Real NDWI' : 'Mean NDWI'}</div>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                    <div className="text-4xl font-extrabold text-orange-400 mb-2 drop-shadow-md">{results.temperature?.toFixed(1) || 'N/A'}°C</div>
                    <div className="text-sm text-slate-400 font-semibold tracking-wide uppercase text-center">{results.metadata ? 'Real LST' : 'Avg Surface Temp'}</div>
                  </div>
                  <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                    <div className="text-4xl font-extrabold text-cyan-400 mb-2 drop-shadow-md">{results.rainfall?.toFixed(1) || 'N/A'}mm</div>
                    <div className="text-sm text-slate-400 font-semibold tracking-wide uppercase text-center">{results.metadata ? 'Real Rain (30d)' : 'Est. Rainfall'}</div>
                  </div>
                </div>
                
                {results.metadata && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-400 shadow-inner">
                    <p className="text-slate-300 font-bold mb-2 uppercase tracking-widest text-[10px]">Actual GEE Computations Executed:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li><span className="text-agrigreen-400 font-semibold">NDVI:</span> {results.metadata.ndvi}</li>
                      <li><span className="text-blue-400 font-semibold">NDWI:</span> {results.metadata.ndwi}</li>
                      <li><span className="text-orange-400 font-semibold">LST:</span> {results.metadata.temperature}</li>
                      <li><span className="text-cyan-400 font-semibold">RAIN:</span> {results.metadata.rainfall}</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 pb-10">
                <span className="text-4xl mb-4 opacity-50">🛰️</span>
                <p>Waiting for region selection to begin processing real-time satellite telemetry.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
