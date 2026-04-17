import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, useMapEvents, LayersControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'];
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

type LatLngTuple = [number, number];

interface AreaData {
  name?: string;
  coordinates: [number, number][];
  isNew?: boolean;
}

// Internal component to attach map click events
function MapEvents({ isDrawing, onMapClick }: { isDrawing: boolean; onMapClick: (pt: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onMapClick([e.latlng.lng, e.latlng.lat]);
      }
    }
  });
  return null;
}

// Sleek floating button to center on user location
function LocateButton() {
  const map = useMap();
  
  const handleLocate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    map.locate({ setView: true, maxZoom: 16 });
  };

  return (
    <div className="absolute top-20 left-3 z-[1000]">
      <button 
        onClick={handleLocate}
        className="glass-panel w-10 h-10 flex items-center justify-center hover:bg-agrigreen-600/20 transition-all shadow-xl border border-slate-700 rounded-xl group"
        title="Find My Location"
      >
        <span className="text-lg group-hover:scale-110 transition-transform">📍</span>
      </button>
    </div>
  );
}

export default function MapWrapper({
  selectedArea,
  isDrawing,
  customPoints,
  onMapClick
}: {
  selectedArea: AreaData | null;
  isDrawing: boolean;
  customPoints: [number, number][];
  onMapClick: (pt: [number, number]) => void;
}) {

  // Memoize coordinate transformations to boost rendering performance
  const presetPositions = useMemo(() => {
    return selectedArea && !selectedArea.isNew && Array.isArray(selectedArea.coordinates)
      ? selectedArea.coordinates.map((c) => [c[1], c[0]] as LatLngTuple)
      : [];
  }, [selectedArea]);

  const drawPositions = useMemo(() => {
    return customPoints.map((pt) => [pt[1], pt[0]] as LatLngTuple);
  }, [customPoints]);

  const customSelectionPositions = useMemo(() => {
    return selectedArea?.isNew && Array.isArray(selectedArea.coordinates)
      ? selectedArea.coordinates.map((c) => [c[1], c[0]] as LatLngTuple)
      : [];
  }, [selectedArea]);

  return (
    <MapContainer 
      center={[25.5, 82.0]} 
      zoom={6} 
      className={`h-full w-full ${isDrawing ? 'cursor-crosshair' : ''}`}
      preferCanvas={true} // Performance: Use Canvas instead of SVG for vector layers
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="Street Map" checked>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Satellite (Esri)">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Topographic">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution="Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <LocateButton />
      <MapEvents isDrawing={isDrawing} onMapClick={onMapClick} />

      {presetPositions.length > 0 && (
        <Polygon positions={presetPositions} pathOptions={{ color: '#22c55e', weight: 2, fillOpacity: 0.4 }} />
      )}

      {drawPositions.length > 0 && !customSelectionPositions.length && (
        <Polygon positions={drawPositions} pathOptions={{ color: '#ef4444', weight: 2, dashArray: '5, 5', fillOpacity: 0.2 }} />
      )}

      {customSelectionPositions.length > 0 && (
        <Polygon positions={customSelectionPositions} pathOptions={{ color: '#3b82f6', weight: 3, fillOpacity: 0.5 }} />
      )}
    </MapContainer>
  );
}
