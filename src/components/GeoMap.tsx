import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

// Custom Cyan Dot Marker
const createCyanIcon = (isSelected: boolean) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    background-color: ${isSelected ? '#fff' : '#00f0ff'};
    width: ${isSelected ? '10px' : '6px'};
    height: ${isSelected ? '10px' : '6px'};
    border-radius: 50%;
    box-shadow: 0 0 ${isSelected ? '12px' : '8px'} ${isSelected ? '#fff' : 'rgba(0, 240, 255, 0.8)'};
    border: 1px solid #fff;
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

// Component to handle auto-centering on selected entity
const MapController = ({ selectedEntityId, events }: { selectedEntityId: string | null, events: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedEntityId) return;
    
    const entityEvents = events.filter(e => 
      (e.entity_id === selectedEntityId || e.counterparty_id === selectedEntityId) && e.location
    );

    if (entityEvents.length > 0) {
      const bounds = L.latLngBounds(entityEvents.map(e => [e.location!.lat, e.location!.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [selectedEntityId, events, map]);

  return null;
};

export const GeoMap = () => {
  const { events, selectedEntityId, setSelectedEntityId } = useAnalyticsStore();

  const mapData = useMemo(() => {
    const locations = events.filter(e => e.location !== null).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Group by entity to draw polylines
    const pathsByEntity: Record<string, [number, number][]> = {};
    locations.forEach(loc => {
      if (!pathsByEntity[loc.entity_id]) pathsByEntity[loc.entity_id] = [];
      pathsByEntity[loc.entity_id].push([loc.location!.lat, loc.location!.lng]);
    });

    return { locations, pathsByEntity };
  }, [events]);

  return (
    <div className="h-full w-full relative bg-[#090C15] z-0">
      <div className="absolute top-0 left-0 w-full h-8 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 shrink-0 z-10 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Geospatial Trajectory</span>
      </div>
      <MapContainer 
        center={[28.6139, 77.2090]} // Default to New Delhi
        zoom={11} 
        zoomControl={false}
        className="w-full h-full bg-[#090C15]"
        style={{ background: '#090C15' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController selectedEntityId={selectedEntityId} events={events} />

        {Object.entries(mapData.pathsByEntity).map(([entityId, coords], idx) => (
          <Polyline 
            key={`path-${entityId}`} 
            positions={coords} 
            color={selectedEntityId === entityId ? '#fff' : '#00f0ff'} 
            weight={selectedEntityId === entityId ? 2 : 1} 
            opacity={selectedEntityId === entityId ? 1 : 0.4}
            dashArray={selectedEntityId === entityId ? "0" : "5, 5"}
          />
        ))}

        {mapData.locations.map((loc, idx) => {
          const isSelected = selectedEntityId === loc.entity_id || selectedEntityId === loc.counterparty_id;
          return (
            <Marker 
              key={`marker-${idx}`}
              position={[loc.location!.lat, loc.location!.lng]}
              icon={createCyanIcon(isSelected)}
              eventHandlers={{
                click: () => setSelectedEntityId(loc.entity_id)
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};
