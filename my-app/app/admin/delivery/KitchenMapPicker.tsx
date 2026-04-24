"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Crosshair } from "lucide-react";

interface AddressDetails {
  full: string;
  city: string;
  pincode: string;
  state: string;
  hNo: string;
  area: string;
}

interface Props {
  onLocationSelect: (lat: number, lng: number, details: AddressDetails) => void;
}

export default function KitchenMapPicker({ onLocationSelect }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState("Drag pin or click Instant Locate...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Leaflet assets
    if (!(window as any).L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      const L = (window as any).L;
      if (!mapContainerRef.current || mapRef.current) return;

      const startPos: [number, number] = [23.2599, 77.4126];
      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(startPos, 15);
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const pin = L.marker(startPos, { draggable: true }).addTo(map);
      markerRef.current = pin;

      const reverseGeocode = async (lat: number, lng: number) => {
        setLoading(true);
        setAddress("📍 Identifying doorway...");
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          const addr = data.display_name;
          const details = data.address || {};
          
          setAddress(addr);
          onLocationSelect(lat, lng, {
            full: addr,
            city: details.city || details.town || details.village || details.county || "",
            pincode: details.postcode || "",
            state: details.state || "",
            hNo: details.house_number || details.building || details.amenity || details.shop || details.office || "",
            area: details.suburb || details.neighbourhood || details.road || details.industrial || ""
          });
        } catch (e) {
          setAddress("Manual address entry needed.");
        } finally {
          setLoading(false);
        }
      };

      pin.on('dragend', () => {
        const pos = pin.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
        map.panTo(pos);
      });

      // Fix for grey box
      setTimeout(() => map.invalidateSize(), 400);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const L = (window as any).L;
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([latitude, longitude], 17);
        markerRef.current.setLatLng([latitude, longitude]);
        
        setLoading(true);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(r => r.json())
          .then(data => {
            const addr = data.display_name;
            const details = data.address || {};
            setAddress(addr);
            onLocationSelect(latitude, longitude, {
               full: addr,
               city: details.city || details.town || details.village || details.county || "",
               pincode: details.postcode || "",
               state: details.state || "",
               hNo: details.house_number || details.building || details.amenity || details.shop || details.office || "",
               area: details.suburb || details.neighbourhood || details.road || details.industrial || ""
            });
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    }, (err) => alert("Please enable GPS for accuracy"), { enableHighAccuracy: true });
  };

  return (
    <div className="space-y-6">
      <div className="relative group/map rounded-[2.5rem] overflow-hidden border-4 border-slate-50 shadow-2xl">
        <div ref={mapContainerRef} className="h-[350px] w-full bg-slate-100 relative z-0"></div>
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3">
             <MapPin size={14} className="text-orange-500" />
             <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Pin your doorway</span>
          </div>
          <button 
             onClick={handleLocate}
             className="bg-black text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-auto hover:bg-orange-600 transition-all active:scale-95 transition-all"
          >
             <Crosshair size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Instant Locate</span>
          </button>
        </div>
      </div>

      <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100 shadow-sm transition-all duration-500 hover:shadow-md">
         <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">Detected Exact Location</p>
         <p className="text-xs font-bold text-slate-700 leading-relaxed min-h-[40px]">
           {loading ? '📍 Identifying doorway...' : address}
         </p>
      </div>
    </div>
  );
}
