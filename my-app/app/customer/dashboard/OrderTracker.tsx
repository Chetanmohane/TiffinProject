"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  status: string;
  driverLocation?: { lat: number; lng: number };
  kitchenAddress?: string;
  kitchenLocation?: { lat: number; lng: number };
  customerAddress?: string;
  eta?: string;
  onTabChange?: (tab: "Lunch" | "Dinner") => void;
  activeTab: "Lunch" | "Dinner";
}

export default function OrderTracker({ 
  status, 
  driverLocation, 
  kitchenAddress,
  kitchenLocation, 
  customerAddress, 
  eta,
  activeTab,
  onTabChange
}: Props) {
  const [showMap, setShowMap] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const coordsRef = useRef<{rest?: any, home?: any}>({});

  // Auto-show map when "Out for Delivery"
  useEffect(() => {
    if (status === "Out for Delivery") setShowMap(true);
  }, [status]);

  const initMap = useCallback(async () => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) {
      // Map already initialized, just invalidate size
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
      return;
    }

    // Load Leaflet CSS + JS
    if (!(window as any).L) {
      await new Promise<void>((resolve) => {
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
        if (!document.getElementById("leaflet-js")) {
          const script = document.createElement("script");
          script.id = "leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        } else {
          resolve();
        }
      });
    }

    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Geocode helper
    const geocode = async (addr: string) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`);
        const data = await res.json();
        return data?.length > 0 ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
      } catch { return null; }
    };

    // Kitchen position: use saved coordinates first (instant), fallback to geocoding if lat/lng are 0 or missing
    const restPos = (kitchenLocation?.lat && kitchenLocation.lat !== 0)
      ? kitchenLocation
      : await geocode(kitchenAddress || "Karond, Bhopal, Madhya Pradesh, India");

    // Customer home position - geocode the address
    const homePos = customerAddress ? await geocode(customerAddress) : null;
    
    // Final coordinates for markers
    coordsRef.current = { 
      rest: restPos || { lat: 23.2974, lng: 77.4025 }, // Fallback to Karond center if all fail
      home: homePos 
    };

    // Starting position for driver marker
    const startLat = driverLocation?.lat || restPos?.lat || 23.2599;
    const startLng = driverLocation?.lng || restPos?.lng || 77.4126;

    // Initialize map
    const map = L.map(mapContainerRef.current, { 
      zoomControl: false, 
      scrollWheelZoom: true,
      attributionControl: false
    }).setView([startLat, startLng], 15);
    mapRef.current = map;

    // Map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Icon creator
    const createIcon = (emoji: string, bg: string, size = 44) => L.divIcon({
      className: '',
      html: `<div style="background:${bg};width:${size}px;height:${size}px;border-radius:${size/2.5}px;display:flex;align-items:center;justify-content:center;font-size:${size*0.55}px;border:3px solid white;box-shadow:0 8px 24px rgba(0,0,0,0.2);">${emoji}</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });

    // Restaurant marker (always visible)
    if (restPos) {
      L.marker([restPos.lat, restPos.lng], { icon: createIcon('🏪', '#f59e0b', 48) }).addTo(map)
       .bindPopup(`<b>Restaurant / Kitchen</b>`);
    }

    // Customer home marker
    if (homePos) {
      L.marker([homePos.lat, homePos.lng], { icon: createIcon('🏠', '#1e293b', 44) }).addTo(map)
       .bindPopup(`<b>Delivery Location</b>`);
    }

    // Driver (scooter) marker
    driverMarkerRef.current = L.marker([startLat, startLng], { 
      icon: createIcon('🛵', '#f97316', 52),
      zIndexOffset: 1000
    }).addTo(map).bindPopup(`<b>Delivery Partner</b>`);

    // Route polyline - use OSRM for real road routing
    const drawRoute = async (from: {lat:number,lng:number}, to: {lat:number,lng:number}) => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          const coords: [number,number][] = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          polylineRef.current = L.polyline(coords, {
            color: '#f97316', weight: 5, opacity: 0.85,
            lineCap: 'round', lineJoin: 'round'
          }).addTo(map);
          polylineRef.current._isRoadRoute = true;
          return coords;
        }
      } catch {}
      // Fallback: simple line
      const pts: [number,number][] = [[from.lat,from.lng],[to.lat,to.lng]];
      polylineRef.current = L.polyline(pts, { color: '#f97316', weight: 5, opacity: 0.7, dashArray: '12, 8' }).addTo(map);
      return pts;
    };

    let pts: [number,number][] = [];
    if (restPos && homePos) {
      pts = await drawRoute(restPos, homePos);
    } else {
      pts = [];
      if (restPos) pts.push([restPos.lat, restPos.lng]);
      pts.push([startLat, startLng]);
      if (homePos) pts.push([homePos.lat, homePos.lng]);
      polylineRef.current = L.polyline(pts, { color: '#f97316', weight: 5, opacity: 0.7, dashArray: '12, 8' }).addTo(map);
    }

    // Fit map to show all markers
    if (pts.length > 1) {
      map.fitBounds(L.latLngBounds(pts), { padding: [60, 60] });
    }

    // Critical: invalidate size after render
    setTimeout(() => {
      map.invalidateSize();
      setMapReady(true);
    }, 300);

  }, [kitchenLocation, kitchenAddress, customerAddress, driverLocation]);

  // Initialize map when showMap becomes true
  useEffect(() => {
    if (!showMap) return;
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => initMap(), 200);
    return () => clearTimeout(timer);
  }, [showMap, initMap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        driverMarkerRef.current = null;
        polylineRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Live driver position update
  useEffect(() => {
    if (!mapRef.current || !driverMarkerRef.current || !driverLocation?.lat) return;
    const newPos: [number, number] = [driverLocation.lat, driverLocation.lng];
    driverMarkerRef.current.setLatLng(newPos);
    
    const pts: [number, number][] = [];
    if (coordsRef.current.rest) pts.push([coordsRef.current.rest.lat, coordsRef.current.rest.lng]);
    pts.push(newPos);
    if (coordsRef.current.home) pts.push([coordsRef.current.home.lat, coordsRef.current.home.lng]);
    polylineRef.current?.setLatLngs(pts);
    mapRef.current.panTo(newPos, { animate: true, duration: 1 });
  }, [driverLocation]);

  const steps = [
    { label: "Confirmed", icon: "📋", matched: ["Confirmed", "Prepared", "Out for Delivery", "Delivered", "Scheduled"] },
    { label: "Prepared", icon: "🍳", matched: ["Prepared", "Out for Delivery", "Delivered"] },
    { label: "On the Way", icon: "🛵", matched: ["Out for Delivery", "Delivered"] },
    { label: "Delivered", icon: "✅", matched: ["Delivered"] },
  ];

  const activeIndex = steps.findLastIndex(s => s.matched.includes(status));
  if (status === "Paused" || (status && status.includes("Holiday"))) return null;

  return (
    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-gray-200/40 border border-gray-50 relative overflow-hidden group transition-all duration-700 hover:border-orange-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">Live Order Tracking</p>
          <h4 className="text-xl font-black text-gray-900 leading-none tracking-tight">Track Your {activeTab} 🍱</h4>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button onClick={() => onTabChange?.("Lunch")} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'Lunch' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Lunch</button>
           <button onClick={() => onTabChange?.("Dinner")} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'Dinner' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Dinner</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showMap ? (
          <motion.div key="stepper" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="relative pt-2">
            <div className="absolute top-7 left-8 right-8 h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }} className="h-full bg-gradient-to-r from-orange-500 to-orange-400" />
            </div>
            <div className="flex justify-between relative z-10">
              {steps.map((step, idx) => {
                const isActive = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                return (
                  <div key={idx} className="flex flex-col items-center gap-3 w-1/4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-700 shadow-lg ${isCurrent ? 'bg-orange-500 text-white scale-110 shadow-orange-200' : isActive ? 'bg-orange-100 text-orange-600' : 'bg-white text-gray-200 border border-gray-100'}`}>{step.icon}</div>
                    <div className="text-center"><p className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</p></div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="map-container" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner"
            style={{ height: '420px' }}
          >
            {/* The actual map div - MUST have explicit height */}
            <div 
              ref={mapContainerRef} 
              style={{ position: 'absolute', inset: 0, height: '100%', width: '100%', zIndex: 0 }} 
            />

            {/* Loading overlay - shown while map initializes */}
            {!mapReady && (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-orange-50 z-10 flex flex-col items-center justify-center gap-4">
                <div className="text-5xl animate-bounce">🛵</div>
                <div className="bg-white/90 px-6 py-3 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Loading Live Map...</p>
                </div>
              </div>
            )}

            {/* Waiting for driver overlay */}
            {mapReady && !driverLocation?.lat && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    Connecting to Driver GPS... 📡
                  </p>
                </div>
              </div>
            )}

            {/* Live badge */}
            {mapReady && (
              <div className="absolute top-4 left-4 z-10 bg-orange-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                LIVE
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'Delivered' ? 'bg-green-500' : 'bg-orange-500 animate-ping'}`} />
            <div>
               <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">STATUS: <span className="text-orange-600">{status || "Scheduled"}</span></p>
               {eta && <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">ESTIMATED: {eta} MINS</p>}
            </div>
         </div>
         <button 
           onClick={() => { 
             setShowMap(prev => !prev);
             if (!showMap) setMapReady(false);
           }} 
           className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${showMap ? 'bg-gray-900 text-white' : 'bg-orange-600 text-white shadow-lg shadow-orange-200'}`}
         >
           {showMap ? 'Show Progress' : '🗺️ Live Tracking'}
         </button>
      </div>
    </div>
  );
}
