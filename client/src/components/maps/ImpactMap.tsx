'use client';

import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow
} from '@vis.gl/react-google-maps';
import AtharProfile from '../ui/AtharProfile';
import { getMapPins, getKhatmaProfile, KhatmaPin } from '@/services/api';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ChevronDown, MapPin, Filter, X } from 'lucide-react';

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
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    getMapPins()
      .then(data => {
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
      .catch(err => console.error('Map fetch error:', err));
  }, []);

  // Update map camera when city changes
  useEffect(() => {
    if (mapInstance && CITY_COORDINATES[selectedCity]) {
      const { lat, lng, zoom } = CITY_COORDINATES[selectedCity];
      mapInstance.setCenter({ lat, lng });
      mapInstance.setZoom(zoom);
    }
  }, [selectedCity, mapInstance]);

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
    getKhatmaProfile(id)
      .then(data => setSelectedProfile(data))
      .catch(err => console.error('Profile fetch error:', err));
  };

  const handleMarkerClick = (pin: KhatmaPin) => {
    setInfoWindowData(pin);
  };

  const getGlowColor = (level: number) => {
    switch(level) {
      case 3: return '#D0A45F'; // Main Gold
      case 2: return '#154A32'; // Deep Green
      case 1: return '#5E203B'; // Deep Burgundy
      default: return '#9D7988'; // Muted Mauve
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
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-gray-50 flex flex-col h-full">
      {/* Header matching the reference image layout */}
      <div className="p-4 bg-white flex justify-between items-center" dir="rtl">
        <h2 className="text-xl font-black text-primary">خريطة الأثر</h2>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-[#F8F7F3] px-4 py-2 rounded-2xl flex items-center gap-3 hover:bg-gray-100 transition-all min-w-[140px] border border-gray-100"
          >
            <ChevronDown
              size={16}
              className={`text-primary-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
            <span className="text-sm font-black text-primary flex-1 text-center">
              {selectedCity === 'all' ? 'جميع المدن' : selectedCity}
            </span>
            <div className="bg-white p-1.5 rounded-lg text-secondary shadow-sm border border-gray-50">
              <MapPin size={14} />
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-secondary-light/10 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => handleCityChange('all')}
                className={`w-full text-right px-5 py-3 text-sm font-bold transition-colors hover:bg-background border-b border-gray-50 ${
                  selectedCity === 'all' ? 'text-secondary bg-background/50' : 'text-primary-muted'
                }`}
              >
                جميع المدن
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCityChange(city)}
                  className={`w-full text-right px-5 py-3 text-sm font-bold transition-colors hover:bg-background border-b border-gray-50 last:border-0 ${
                    selectedCity === city ? 'text-secondary bg-background/50' : 'text-primary-muted'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 min-h-[500px]">
        <APIProvider
          apiKey={GOOGLE_MAPS_API_KEY}
          onLoad={() => console.log('Google Maps API loaded')}
          onError={(err) => {
            console.error('Google Maps Load Error:', err);
            setMapError(true);
          }}
        >
          <Map
            defaultCenter={CITY_COORDINATES['الرياض']}
            defaultZoom={CITY_COORDINATES['الرياض'].zoom}
            mapId="ATHAR_IMPACT_MAP"
            className="w-full h-full"
            disableDefaultUI={false}
            clickableIcons={false}
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

            {infoWindowData && (
              <InfoWindow
                position={infoWindowData.location}
                onCloseClick={() => setInfoWindowData(null)}
                headerDisabled
              >
                <div className="p-3 pr-8 text-right relative min-w-[200px]" dir="rtl">
                  {/* Custom Close Button */}
                  <button
                    onClick={() => setInfoWindowData(null)}
                    className="absolute top-0 left-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                    <h3 className="font-black text-lg text-[#154A32] leading-tight">{infoWindowData.user_name}</h3>
                  </div>

                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin size={10} /> {selectedCity === 'all' ? 'المملكة العربية السعودية' : selectedCity}
                  </p>

                  <p className="text-sm text-gray-600 mb-3 border-t border-gray-50 pt-2">
                    إجمالي الأثر: <span className="font-black text-[#D0A45F] text-base">{infoWindowData.total_impact || 0}</span>
                  </p>

                  <div className="flex flex-wrap gap-1 justify-end mb-4">
                    {infoWindowData.services.slice(0, 3).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-background border border-secondary-light/10 rounded-lg text-[9px] font-bold text-primary-muted">{s}</span>
                    ))}
                    {infoWindowData.services.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-50 rounded-lg text-[9px] font-bold text-gray-400">+{infoWindowData.services.length - 3}</span>
                    )}
                  </div>

                  <button
                    onClick={() => openProfile(infoWindowData.user_id)}
                    className="w-full py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-[#4a1a2f] transition-all shadow-md shadow-primary/10 active:scale-95"
                  >
                    عرض الملف الشخصي
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
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

const CustomMarker = ({ pin, onClick, getGlowColor, getGlowShadow }: any) => {
  return (
    <AdvancedMarker
      position={pin.location}
      onClick={onClick}
    >
      <div
        className={`marker glow-level-${pin.glow_level}`}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: getGlowColor(pin.glow_level),
          boxShadow: getGlowShadow(pin.glow_level),
          cursor: 'pointer',
          animation: pin.glow_level >= 2 ? 'pulse 2s infinite' : 'none',
          border: '2px solid white'
        }}
      />
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
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#154A32';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      new maplibregl.Marker(el)
        .setLngLat([pin.location.lng, pin.location.lat])
        .setPopup(new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-3 text-right" dir="rtl">
              <h3 class="font-black text-[#154A32] mb-1">${pin.user_name}</h3>
              <p class="text-[11px] text-gray-600 mb-3">إجمالي الأثر: <span class="font-bold text-[#D0A45F]">${pin.total_impact || 0}</span></p>
              <button
                id="profile-btn-${pin.user_id}"
                class="w-full py-2 bg-[#154A32] text-white text-[10px] font-black rounded-xl hover:bg-[#0d3121] transition-colors"
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
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 z-10 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-red-600 shadow-sm">
        Google Maps load failed. Using fallback map.
      </div>
    </div>
  );
};

export default ImpactMap;
