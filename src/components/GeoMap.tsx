import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

const createTerracottaIcon = (isSelected: boolean) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    background-color: ${isSelected ? '#6B2E12' : '#C4622D'};
    width: ${isSelected ? '10px' : '6px'};
    height: ${isSelected ? '10px' : '6px'};
    border-radius: 50%;
    box-shadow: 0 0 ${isSelected ? '8px' : '4px'} ${isSelected ? 'rgba(107, 46, 18, 0.5)' : 'rgba(196, 98, 45, 0.4)'};
    border: 1.5px solid ${isSelected ? '#2A2420' : '#8C3D1A'};
  "></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

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

export const GeoMap: React.FC = () => {
  const { events, selectedEntityId, setSelectedEntityId } = useAnalyticsStore();

  const mapData = useMemo(() => {
    const locations = events.filter(e => e.location !== null).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const pathsByEntity: Record<string, [number, number][]> = {};
    locations.forEach(loc => {
      if (!pathsByEntity[loc.entity_id]) pathsByEntity[loc.entity_id] = [];
      pathsByEntity[loc.entity_id].push([loc.location!.lat, loc.location!.lng]);
    });

    return { locations, pathsByEntity };
  }, [events]);

  return (
    <div className="h-full w-full relative bg-[#FAF6F0] z-0">
      <div className="absolute top-0 left-0 w-full h-8 border-b border-[#DDD5CA] bg-[#F3EDE4] flex items-center px-4 shrink-0 z-10 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-[#7A6F63] font-semibold">Geospatial Trajectory</span>
      </div>
      <MapContainer 
        center={[28.6139, 77.2090]}
        zoom={11} 
        zoomControl={false}
        className="w-full h-full bg-[#FAF6F0]"
        style={{ background: '#FAF6F0' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController selectedEntityId={selectedEntityId} events={events} />

        {Object.entries(mapData.pathsByEntity).map(([entityId, coords]) => (
          <Polyline 
            key={`path-${entityId}`} 
            positions={coords} 
            color={selectedEntityId === entityId ? '#6B2E12' : '#C4622D'} 
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
              icon={createTerracottaIcon(isSelected)}
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
