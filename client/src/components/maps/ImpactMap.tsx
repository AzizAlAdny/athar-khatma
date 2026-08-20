'use client';

import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow
} from '@vis.gl/react-google-maps';
import AtharProfile from '../ui/AtharProfile';
import { getMapPins, getPublicProfile, KhatmaPin } from '@/services/api';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ChevronDown, MapPin, Filter, X, Gift } from 'lucide-react';

import { themeColors } from '@/constants/theme';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const CITY_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  all: { lat: 24.0, lng: 45.0, zoom: 5 },
  'الرياض': { lat: 24.7136, lng: 46.6753, zoom: 11 },
  'جدة': { lat: 21.4858, lng: 39.1925, zoom: 11 },
  'الدمام': { lat: 26.4207, lng: 50.0888, zoom: 11 },
  'مكة المكرمة': { lat: 21.3891, lng: 39.8579, zoom: 11 },
  'المدينة المنورة': { lat: 24.5247, lng: 39.5692, zoom: 11 },
};

const ImpactMap = () => {
  const [pins, setPins] = useState<KhatmaPin[]>([]);
  const [filteredPins, setFilteredPins] = useState<KhatmaPin[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [infoWindowData, setInfoWindowData] = useState<KhatmaPin | null>(null);
  const [mapError, setMapError] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('الرياض');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    getMapPins()
      .then(data => {
        console.log('Map pins received:', data);
        setPins(data);
        // Apply initial filter (Riyadh)
        const initialFiltered = data.filter(p => p.city === 'الرياض');
        setFilteredPins(initialFiltered.length > 0 ? initialFiltered : data);

        // Extract unique cities dynamically from backend data
        const availableCities = Array.from(new Set(data.map(p => p.city))).filter(Boolean) as string[];
        if (availableCities.length > 0) {
          setCities(availableCities);
        }
      })
      .catch(err => {
        console.error('Map fetch error:', err);
        setMapError(true);
      });
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setIsDropdownOpen(false);
    setInfoWindowData(null);

    if (city === 'all') {
      setFilteredPins(pins);
    } else {
      // Filter pins by city name
      const filtered = pins.filter(p => p.city === city);
      setFilteredPins(filtered);
    }
  };

  const openProfile = (id: number) => {
    getPublicProfile(id)
      .then(data => setSelectedProfile(data))
      .catch(err => console.error('Profile fetch error:', err));
  };

  const handleMarkerClick = (pin: KhatmaPin) => {
    setInfoWindowData(pin);
  };

  const getGlowColor = (level: number): string => {
    switch (level) {
      case 3: return themeColors.glow.level3;
      case 2: return themeColors.glow.level2;
      case 1: return themeColors.glow.level1;
      default: return themeColors.glow.level0;
    }
  };

  const getGlowShadow = (level: number) => {
    if (level === 3) return '0 0 15px 5px rgba(208, 164, 95, 0.4)';
    if (level === 2) return '0 0 10px 3px rgba(21, 74, 50, 0.3)';
    return 'none';
  };

  if (mapError) {
    return <OsmFallback pins={pins} openProfile={openProfile} />;
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-background flex flex-col h-full">
      {/* Header matching the reference image layout */}
      <div className="p-4 bg-white flex justify-between items-center" dir="rtl">
        <h2 className="text-lg font-black text-primary">خريطة الأثر</h2>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-background px-4 py-2 rounded-2xl flex items-center gap-3 hover:bg-secondary-light/20 transition-all min-w-[140px] border border-secondary-light/30"
          >
            <ChevronDown
              size={16}
              className={`text-primary-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
            <span className="text-sm font-black text-primary flex-1 text-center">
              {selectedCity === 'all' ? 'جميع المدن' : selectedCity}
            </span>
            <div className="bg-white p-1.5 rounded-lg text-secondary shadow-sm border border-secondary-light/20">
              <MapPin size={14} />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-secondary-light/10 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => handleCityChange('all')}
                className={`w-full text-right px-5 py-3 text-sm font-bold transition-colors hover:bg-background border-b border-background ${selectedCity === 'all' ? 'text-secondary bg-background/50' : 'text-primary-muted'
                  }`}
              >
                جميع المدن
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`w-full text-right px-5 py-3 text-sm font-bold transition-colors hover:bg-background border-b border-background last:border-0 ${selectedCity === city ? 'text-secondary bg-background/50' : 'text-primary-muted'
                    }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-[380px] sm:min-h-[480px] md:min-h-[560px]">
        <MapsErrorBoundary onError={() => setMapError(true)}>
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={{ lat: 24.7136, lng: 46.6753 }}
            defaultZoom={11}
            center={CITY_COORDINATES[selectedCity] ? { lat: CITY_COORDINATES[selectedCity].lat, lng: CITY_COORDINATES[selectedCity].lng } : undefined}
            zoom={CITY_COORDINATES[selectedCity]?.zoom}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            mapId="athar_impact_map"
          >
            {filteredPins.map((pin) => (
              <CustomMarker
                key={pin.user_id}
                pin={pin}
                onClick={() => handleMarkerClick(pin)}
                getGlowColor={getGlowColor}
                getGlowShadow={getGlowShadow}
              />
            ))}

            {infoWindowData && (() => {
              const lat = typeof infoWindowData.location.lat === 'string' ? parseFloat(infoWindowData.location.lat) : infoWindowData.location.lat;
              const lng = typeof infoWindowData.location.lng === 'string' ? parseFloat(infoWindowData.location.lng) : infoWindowData.location.lng;

              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <InfoWindow
                  position={{ lat, lng }}
                  onCloseClick={() => setInfoWindowData(null)}
                  headerDisabled={true}
                >
                  <div className="p-4 text-right relative font-sans" dir="rtl">
                    <button
                      onClick={() => setInfoWindowData(null)}
                      className="absolute top-3 left-3 text-primary-muted hover:text-primary transition-colors p-1"
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      <h3 className="font-black text-lg text-accent leading-tight">{infoWindowData.user_name}</h3>
                    </div>

                    <p className="text-xs text-primary-muted mb-2 flex items-center gap-1">
                      <MapPin size={10} /> {selectedCity === 'all' ? 'المملكة العربية السعودية' : selectedCity}
                    </p>

                    <p className="text-sm text-primary-muted mb-3 border-t border-secondary-light/20 pt-2">
                      إجمالي الأثر: <span className="font-black text-secondary text-base">{infoWindowData.total_impact || 0}</span>
                    </p>

                    <div className="flex flex-wrap gap-1 justify-end mb-4">
                      {infoWindowData.gifts.slice(0, 3).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 bg-background border border-secondary-light/10 rounded-lg text-[9px] font-bold text-primary-muted">{s}</span>
                      ))}
                      {infoWindowData.gifts.length > 3 && (
                        <span className="px-2 py-0.5 bg-background border border-secondary-light/10 rounded-lg text-[9px] font-bold text-primary-muted">+{infoWindowData.gifts.length - 3}</span>
                      )}
                    </div>

                    <button
                      onClick={() => openProfile(infoWindowData.user_id)}
                      className="w-full py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/10 active:scale-95"
                    >
                      عرض الملف الشخصي
                    </button>
                  </div>
                </InfoWindow>
              );
            })()}
          </Map>
        </APIProvider>
        </MapsErrorBoundary>
      </div>

      {selectedProfile && (
        <AtharProfile data={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Catches Google Maps runtime failures (e.g. demo-key quota exhausted,
// marker/InfoWindow portals without a live map container) and hands control
// back to ImpactMap so it can render the OSM fallback.
class MapsErrorBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Google Maps runtime error, switching to fallback map:', error);
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

const CustomMarker = ({ pin, onClick, getGlowColor, getGlowShadow }: any) => {
  const lat = typeof pin.location.lat === 'string' ? parseFloat(pin.location.lat) : pin.location.lat;
  const lng = typeof pin.location.lng === 'string' ? parseFloat(pin.location.lng) : pin.location.lng;

  // Validate coordinates before rendering
  if (isNaN(lat) || isNaN(lng)) {
    console.error('Invalid coordinates for pin:', pin);
    return null;
  }

  const position = { lat, lng };

  return (
    <AdvancedMarker
      position={position}
      onClick={onClick}
    >
            <div
        className={`marker glow-level-${pin.glow_level} flex items-center justify-center`}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          backgroundColor: getGlowColor(pin.glow_level),
          boxShadow: getGlowShadow(pin.glow_level),
          cursor: 'pointer',
          animation: pin.glow_level >= 2 ? 'pulse 2s infinite' : 'none',
          border: '2px solid white',
          color: '#ffffff'
        }}
      >
        <Gift size={18} strokeWidth={2.5} />
      </div>
    </AdvancedMarker>
  );
};

const OsmFallback = ({ pins, openProfile }: any) => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm-layer',
          type: 'raster',
          source: 'osm'
        }]
      },
      center: [45.0, 24.0],
      zoom: 5
    });

    map.current.addControl(new maplibregl.NavigationControl());

    pins.forEach((pin: any) => {
      const el = document.createElement('div');
      el.style.width = '34px';
      el.style.height = '34px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = themeColors.accent.DEFAULT;
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = '#ffffff';
      el.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5 4.8 8 0 0 1 4.5 5 4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>';

      const lat = typeof pin.location.lat === 'string' ? parseFloat(pin.location.lat) : pin.location.lat;
      const lng = typeof pin.location.lng === 'string' ? parseFloat(pin.location.lng) : pin.location.lng;

      new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-3 text-right" dir="rtl">
              <h3 class="font-black text-accent mb-1">${pin.user_name}</h3>
              <p class="text-[11px] text-primary-muted mb-3">إجمالي الأثر: <span class="font-bold text-secondary">${pin.total_impact || 0}</span></p>
              <button
                id="profile-btn-${pin.user_id}"
                class="w-full py-2 bg-accent text-white text-[10px] font-black rounded-xl hover:bg-accent-dark transition-colors"
              >
                عرض الملف الشخصي
              </button>
            </div>
          `))
        .addTo(map.current!);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [pins, openProfile]);

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] md:h-[580px] rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-red-600 shadow-sm">
        Google Maps load failed. Using fallback map.
      </div>
    </div>
  );
};

export default ImpactMap;
