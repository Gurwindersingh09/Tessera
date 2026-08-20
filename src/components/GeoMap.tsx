import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useTheme } from '../context/ThemeContext';

const createEntityIcon = (type: string, isSelected: boolean, isDark: boolean) => {
  let color = '#C4622D';
  let borderRadius = '50%';

  if (type === 'BANK_ACCOUNT') {
    color = '#8C3D1A';
    borderRadius = '2px';
  } else if (type === 'SOCIAL_HANDLE') {
    color = '#D4854A';
    borderRadius = '2px';
  } else if (type === 'PERSON') {
    color = isDark ? '#EDEEF0' : '#2A2420';
    borderRadius = '50%';
  }

  const markerBorder = isSelected ? '#FFFFFF' : (isDark ? '#17181B' : '#FAF6F0');
  const shadowColor = isSelected ? 'rgba(196, 98, 45, 0.85)' : (isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(42, 36, 32, 0.35)');

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: ${isSelected ? '12px' : '8px'};
      height: ${isSelected ? '12px' : '8px'};
      border-radius: ${borderRadius};
      box-shadow: 0 0 ${isSelected ? '10px' : '4px'} ${shadowColor};
      border: 1.5px solid ${markerBorder};
      transform: ${type === 'SOCIAL_HANDLE' ? 'rotate(45deg)' : 'none'};
      transition: all 150ms ease;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
};

const MapController = ({ selectedEntityId, events }: { selectedEntityId: string | null, events: any[] }) => {
  const map = useMap();

  useEffect(() => {
    if (!selectedEntityId) return;
    
    const entityEvents = events.filter(e => 
      (e.entity_id === selectedEntityId || e.counterparty_id === selectedEntityId) && e.location
    );

    if (entityEvents.length > 0) {
      const bounds = L.latLngBounds(entityEvents.map(e => [e.location!.lat, e.location!.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [selectedEntityId, events, map]);

  return null;
};

export const GeoMap: React.FC = () => {
  const { events, selectedEntityId, setSelectedEntityId, entities } = useAnalyticsStore();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const entityTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    entities.forEach(e => { map[e.id] = e.type; });
    return map;
  }, [entities]);

  const mapData = useMemo(() => {
    const locations = events.filter(e => e.location !== null).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    const pathsByEntity: Record<string, [number, number][]> = {};
    locations.forEach(loc => {
      if (!pathsByEntity[loc.entity_id]) pathsByEntity[loc.entity_id] = [];
      pathsByEntity[loc.entity_id].push([loc.location!.lat, loc.location!.lng]);
    });

    return { locations, pathsByEntity };
  }, [events]);

  const tileLayerUrl = isDark 
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="h-full w-full relative z-0" style={{ background: 'var(--color-bg-base)' }}>
      {/* Header bar */}
      <div 
        className="absolute top-0 left-0 w-full h-8 flex items-center justify-between px-4 shrink-0 z-10 pointer-events-none"
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-surface)',
        }}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          Geospatial Trajectory
        </span>
        <span className="text-[9.5px] font-mono font-medium" style={{ color: '#C4622D' }}>
          {mapData.locations.length} points plotted
        </span>
      </div>

      <MapContainer 
        key={theme}
        center={[28.6139, 77.2090]}
        zoom={11} 
        zoomControl={false}
        className="w-full h-full"
        style={{
          background: isDark ? '#0D0E10' : '#FAF6F0',
          filter: isDark ? 'contrast(1.05) brightness(0.95)' : 'sepia(0.24) saturate(0.92) contrast(1.04) brightness(0.98)',
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileLayerUrl}
        />
        
        <MapResizeHandler />
        <MapController selectedEntityId={selectedEntityId} events={events} />

        {Object.entries(mapData.pathsByEntity).map(([entityId, coords]) => {
          const isSelected = selectedEntityId === entityId;
          const entityType = entityTypeMap[entityId] || 'PHONE';
          const strokeColor = entityType === 'BANK_ACCOUNT' ? '#8C3D1A' : '#C4622D';

          return (
            <Polyline 
              key={`path-${entityId}`} 
              positions={coords} 
              color={strokeColor} 
              weight={isSelected ? 2.5 : 1.5} 
              opacity={isSelected ? 1 : 0.65}
              dashArray={isSelected ? "0" : "4, 4"}
            />
          );
        })}

        {mapData.locations.map((loc, idx) => {
          const isSelected = selectedEntityId === loc.entity_id || selectedEntityId === loc.counterparty_id;
          const entityType = entityTypeMap[loc.entity_id] || 'PHONE';

          return (
            <Marker 
              key={`marker-${idx}`}
              position={[loc.location!.lat, loc.location!.lng]}
              icon={createEntityIcon(entityType, isSelected, isDark)}
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
export default GeoMap;
