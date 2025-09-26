import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Destination } from '@/utils/types';
import { DEFAULT_VALUES } from '@/utils/constants';
import { clsx } from 'clsx';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const primaryIcon = createCustomIcon('#3b82f6');
const secondaryIcon = createCustomIcon('#0ea5e9');
const selectedIcon = createCustomIcon('#ef4444');

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFullscreen: () => void;
  onLocateUser: () => void;
  isFullscreen: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onFullscreen,
  onLocateUser,
  isFullscreen,
}) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
      <Button
        variant="outline"
        size="sm"
        icon={ZoomIn}
        onClick={onZoomIn}
        className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200"
      >
        Zoom In
      </Button>
      <Button
        variant="outline"
        size="sm"
        icon={ZoomOut}
        onClick={onZoomOut}
        className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200"
      >
        Zoom Out
      </Button>
      <Button
        variant="outline"
        size="sm"
        icon={Navigation}
        onClick={onLocateUser}
        className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200"
      >
        Locate
      </Button>
      <Button
        variant="outline"
        size="sm"
        icon={Maximize2}
        onClick={onFullscreen}
        className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200"
      >
        Fullscreen
      </Button>
    </div>
  );
};

// Component to handle map events and controls
const MapController: React.FC<{
  destinations: Destination[];
  selectedDestination?: Destination;
  onDestinationSelect?: (destination: Destination) => void;
  onMapReady?: (map: L.Map) => void;
}> = ({ destinations, selectedDestination, onDestinationSelect, onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    onMapReady?.(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (selectedDestination && selectedDestination.latitude && selectedDestination.longitude) {
      map.setView([selectedDestination.latitude, selectedDestination.longitude], 10, {
        animate: true,
        duration: 1,
      });
    }
  }, [selectedDestination, map]);

  useEffect(() => {
    if (destinations.length > 0) {
      const validDestinations = destinations.filter(d => d.latitude && d.longitude);
      
      if (validDestinations.length === 1) {
        const dest = validDestinations[0];
        map.setView([dest.latitude!, dest.longitude!], 10);
      } else if (validDestinations.length > 1) {
        const bounds = L.latLngBounds(
          validDestinations.map(dest => [dest.latitude!, dest.longitude!])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [destinations, map]);

  return null;
};

interface DestinationMapProps {
  destinations: Destination[];
  selectedDestination?: Destination;
  onDestinationSelect?: (destination: Destination) => void;
  height?: string;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
}

const DestinationMap: React.FC<DestinationMapProps> = ({
  destinations,
  selectedDestination,
  onDestinationSelect,
  height = '400px',
  className = '',
  showControls = true,
  interactive = true,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const validDestinations = destinations.filter(d => d.latitude && d.longitude);
  
  const center: [number, number] = selectedDestination && selectedDestination.latitude && selectedDestination.longitude
    ? [selectedDestination.latitude, selectedDestination.longitude]
    : validDestinations.length > 0
      ? [validDestinations[0].latitude!, validDestinations[0].longitude!]
      : [DEFAULT_VALUES.MAP_CENTER[0], DEFAULT_VALUES.MAP_CENTER[1]];

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetView = () => {
    if (validDestinations.length > 1) {
      const bounds = L.latLngBounds(
        validDestinations.map(dest => [dest.latitude!, dest.longitude!])
      );
      mapRef.current?.fitBounds(bounds, { padding: [20, 20] });
    } else if (validDestinations.length === 1) {
      const dest = validDestinations[0];
      mapRef.current?.setView([dest.latitude!, dest.longitude!], 10);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLocateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          mapRef.current?.setView([latitude, longitude], 12);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Invalidate map size after fullscreen change
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (validDestinations.length === 0) {
    return (
      <div 
        className={clsx('bg-gray-100 rounded-lg flex items-center justify-center', className)}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No locations available to display</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={clsx(
        'relative rounded-lg overflow-hidden border border-gray-200 shadow-lg',
        isFullscreen && 'fixed inset-0 z-50 rounded-none border-0',
        className
      )}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      <MapContainer
        center={center}
        zoom={validDestinations.length === 1 ? 10 : DEFAULT_VALUES.MAP_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          destinations={validDestinations}
          selectedDestination={selectedDestination}
          onDestinationSelect={onDestinationSelect}
          onMapReady={handleMapReady}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={userLocation}
            icon={L.divIcon({
              html: `
                <div style="
                  background: linear-gradient(45deg, #3b82f6, #1d4ed8);
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
                  animation: pulse 2s infinite;
                "></div>
              `,
              className: 'user-location-marker',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>
              <div className="p-2 text-center">
                <div className="font-medium text-blue-600">Your Location</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Markers */}
        {validDestinations.map((destination) => {
          const isSelected = selectedDestination?.id === destination.id;
          const icon = isSelected ? selectedIcon : 
                      destinations.indexOf(destination) === 0 ? primaryIcon : secondaryIcon;

          return (
            <Marker
              key={destination.id}
              position={[destination.latitude!, destination.longitude!]}
              icon={icon}
              eventHandlers={onDestinationSelect ? {
                click: () => onDestinationSelect(destination),
              } : {}}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="font-semibold text-lg text-gray-900 mb-1">
                    {destination.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {destination.country}
                  </div>
                  {destination.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                      {destination.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => window.open(`/destinations/${destination.id}`, '_blank')}
                    >
                      View Details
                    </Button>
                    {onDestinationSelect && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDestinationSelect(destination)}
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Controls */}
      {showControls && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onFullscreen={handleFullscreen}
          onLocateUser={handleLocateUser}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <div className="text-sm font-medium text-gray-900 mb-2">Legend</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Primary Destination</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span>Other Destinations</span>
          </div>
          {selectedDestination && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Selected</span>
            </div>
          )}
          {userLocation && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
              <span>Your Location</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <style jsx global>{`
        .user-location-marker {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .custom-marker {
          transition: all 0.3s ease;
        }

        .custom-marker:hover {
          transform: scale(1.1);
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }

        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default DestinationMap;