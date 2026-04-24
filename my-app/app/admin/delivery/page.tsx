"use client";
import { Phone, CheckCircle, Clock, MapPin, Truck, Map as MapIcon, X, Navigation, Crosshair } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KitchenMapPicker from "./KitchenMapPicker";

/* ---------------- TYPES ---------------- */

interface DeliveryCustomer {
  id: string; 
  deliveryId: string | null;
  customerId: string;
  customerName: string;
  phone: string;
  address: string;
  type: "Lunch" | "Dinner";
  planType: "Lunch" | "Dinner" | "Both";
  status: string;
  paused: boolean;
  mealsLeft: number;
}

/* ---------------- COMPONENT ---------------- */

export default function DailyDeliveryPage() {
  const [deliveries, setDeliveries] = useState<DeliveryCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "Lunch" | "Dinner" | "Both">("ALL");
  const [search, setSearch] = useState("");
  const [kitchenAddress, setKitchenAddress] = useState("Bhopal, India");
  const [savingKitchen, setSavingKitchen] = useState(false);
  const [mapCoords, setMapCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isKitchenModalOpen, setIsKitchenModalOpen] = useState(false);
  const [kitchenForm, setKitchenForm] = useState({
    hNo: "",
    colony: "",
    area: "",
    city: "Bhopal",
    state: "Madhya Pradesh",
    pincode: ""
  });
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isKitchenModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isKitchenModalOpen]);

  const IST_OFFSET = 5.5 * 60 * 60 * 1000;
  const todayStr = new Date(new Date().getTime() + IST_OFFSET).toISOString().split("T")[0];

  const [serverDate, setServerDate] = useState("");

  const fetchDeliveries = () => {
    setLoading(true);
    fetch("/api/admin/delivery")
      .then(res => res.json())
      .then(data => {
        setDeliveries(data.deliveries || []);
        if (data.date) setServerDate(data.date);
        if (data.kitchenAddress) setKitchenAddress(data.kitchenAddress);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const saveKitchenAddress = async (manualAddress?: string, coords?: { lat: number, lng: number }) => {
    setSavingKitchen(true);
    const finalAddress = manualAddress || kitchenAddress;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contact: { 
            address: finalAddress,
            latitude: coords?.lat,
            longitude: coords?.lng
          } 
        })
      });
      if (res.ok) {
        setKitchenAddress(finalAddress);
        toast.success("Kitchen Location Fixed! 📍");
        setIsKitchenModalOpen(false);
      }
    } catch (e) {
      toast.error("Failed to save location");
    } finally {
      setSavingKitchen(false);
    }
  };

  const handleLiveLocation = () => {
    if (!('geolocation' in navigator)) return toast.error("Geolocation not supported");
    
    toast.loading("Fetching live address details...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        toast.dismiss();
        
        if (data.address || data.display_name) {
          const addr = data.address || {};
          const displayName = data.display_name || "";
          const parts = displayName.split(',').map(p => p.trim());
          
          setKitchenForm({
            hNo: addr.house_number || addr.building || addr.office || addr.house_name || "",
            colony: addr.suburb || addr.neighbourhood || addr.residential || addr.community || addr.subdistrict || parts[1] || "",
            area: addr.road || addr.pedestrian || addr.path || addr.industrial || addr.commercial || parts[0] || "",
            city: addr.city || addr.town || addr.village || addr.municipality || addr.county || parts[2] || "Bhopal",
            state: addr.state || addr.region || parts[3] || "Madhya Pradesh",
            pincode: addr.postcode || ""
          });
          toast.success("GPS Data Received! 📍");
        }
      } catch (e) {
        toast.dismiss();
        toast.error("Could not resolve address details. Please fill manually.");
      }
    }, () => {
      toast.dismiss();
      toast.error("GPS access denied");
    });
  };

  const initMapPicker = () => {
    if (!('geolocation' in navigator)) return;
    setShowMapPicker(true);
    
    setTimeout(() => {
        const container = document.getElementById('kitchen-map-picker');
        if (!container || !window.L || container._leaflet_id) {
           if (container?._leaflet_id) {
              const map = container._leaflet_map; 
              if (map) {
                 map.invalidateSize();
                 navigator.geolocation.getCurrentPosition((pos) => {
                    map.setView([pos.coords.latitude, pos.coords.longitude], 16);
                 });
              }
           }
           return;
        }

        navigator.geolocation.getCurrentPosition((pos) => {
           const lat = pos.coords.latitude;
           const lng = pos.coords.longitude;
           const map = L.map('kitchen-map-picker', { 
             zoomControl: false,
             attributionControl: false 
           }).setView([lat, lng], 16);
           
           container._leaflet_map = map; // Store for ref
           
           L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);
           const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
           
           // CRITICAL: Fix grey box issue
           setTimeout(() => map.invalidateSize(), 400);

           const updateFromPos = async (lt: number, lg: number) => {
              try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lt}&lon=${lg}`);
                const data = await res.json();
                if (data.display_name) {
                   const addr = data.address || {};
                   const parts = data.display_name.split(',').map((p:any) => p.trim());
                   setKitchenForm({
                      hNo: addr.house_number || addr.building || "",
                      colony: addr.suburb || addr.neighbourhood || addr.residential || parts[1] || "",
                      area: addr.road || addr.pedestrian || parts[0] || "",
                      city: addr.city || addr.town || addr.village || parts[2] || "Bhopal",
                      state: addr.state || parts[3] || "Madhya Pradesh",
                      pincode: addr.postcode || ""
                   });
                }
              } catch(e) {}
           };

           updateFromPos(lat, lng);
           marker.on('dragend', (e) => {
              const { lat, lng } = e.target.getLatLng();
              updateFromPos(lat, lng);
           });
        });
    }, 500);
  };

  useEffect(() => {
    fetchDeliveries();
    
    // Auto-refresh every 30 seconds for live updates
    const interval = setInterval(() => {
      // Fetch without global loading spinner for a smoother experience
      fetch("/api/admin/delivery")
        .then(res => res.json())
        .then(data => {
          setDeliveries(data.deliveries || []);
          if (data.date) setServerDate(data.date);
          if (data.kitchenAddress) setKitchenAddress(data.kitchenAddress);
        })
        .catch(err => console.error("Auto-refresh failed", err));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (item: DeliveryCustomer, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: item.deliveryId || item.id,
          status: newStatus,
          customerId: item.customerId,
          type: item.type
        })
      });
      if (res.ok) {
        toast.success(`Marked as ${newStatus}`);
        fetchDeliveries();
      } else {
        toast.error("Failed to update status");
      }
    } catch (e) {
      toast.error("Error updating status");
    }
  };

  const resumeService = async (customerId: string) => {
     window.location.href = "/admin/pause";
  };

  const simulateLiveTracking = async (item: DeliveryCustomer) => {
    try {
      const res = await fetch("/api/admin/delivery/update-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          deliveryId: item.deliveryId || item.id,
          lat: 18.5204 + (Math.random() * 0.01),
          lng: 73.8567 + (Math.random() * 0.01),
          estimatedArrival: Math.floor(Math.random() * 15 + 5).toString()
        })
      });
      if (res.ok) {
        toast.success("Live Location Updated!");
        fetchDeliveries();
      }
    } catch (e) {
      toast.error("Simulation failed");
    }
  };

  /* ---------------- REAL TRACKING LOGIC ---------------- */
  useEffect(() => {
    let watchId: number;
    if (activeTrackingId) {
      if ("geolocation" in navigator) {
        toast.success("Live GPS Tracking Started! 📡");
        watchId = navigator.geolocation.watchPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
              if ((window as any)._updateAdminMap) {
                (window as any)._updateAdminMap(latitude, longitude);
              }
              await fetch("/api/admin/delivery/update-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  deliveryId: activeTrackingId,
                  lat: latitude,
                  lng: longitude,
                  estimatedArrival: "Calculating..." // Real math could go here
                })
              });
            } catch (e) { console.error("Sync error", e); }
          },
          (err) => {
            toast.error("GPS Permission Denied");
            setActiveTrackingId(null);
          },
          { enableHighAccuracy: true }
        );
      }
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [activeTrackingId]);

  /* ---------------- DERIVED DATA ---------------- */

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      let matchesFilter = true;
      if (filter === "Both") {
         matchesFilter = d.planType === "Both";
      } else if (filter !== "ALL") {
         matchesFilter = d.type === filter;
      }

      const matchesSearch = 
        d.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        d.address?.toLowerCase().includes(search.toLowerCase()) ||
        d.phone?.includes(search);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, deliveries]);

  const total = filteredDeliveries.length;
  const deliveredCount = filteredDeliveries.filter((d) => d.status === "Delivered").length;
  const pausedCount = filteredDeliveries.filter((d) => d.paused).length;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">🚚 Daily Delivery List</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-500 mt-1">
              Showing all active plans for <b className="text-gray-900">{serverDate || todayStr}</b>
            </p>
          </div>
          <button 
            onClick={fetchDeliveries}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Clock size={16} /> Refresh Now
          </button>
        </div>

        {/* KITCHEN CONFIG */}
        <div className="mb-8 bg-orange-50 border border-orange-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
           <div className="bg-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-orange-600 shadow-md border border-orange-50">
              <MapIcon size={30} />
           </div>
           <div className="flex-1 w-full text-center md:text-left">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-2">Kitchen / Restaurant Origin (Live Tracking Source)</p>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                {kitchenAddress || "Location Not Configured"}
              </h2>
           </div>
           <button 
             onClick={() => setIsKitchenModalOpen(true)}
             className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shadow-xl"
           >
             <Navigation size={18} /> Update Location
           </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total Orders" value={total} color="bg-white text-gray-900" />
          <StatCard title="Delivered" value={deliveredCount} color="bg-green-600 text-white" />
          <StatCard title="Paused Today" value={pausedCount} color="bg-red-600 text-white" />
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            placeholder="Search by name, address or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-5 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
          />
          <div className="flex gap-2 flex-wrap">
            {["ALL", "Lunch", "Dinner", "Both"].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t as any)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === t ? "bg-orange-500 text-white" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        
        {/* LIVE TRACKING NAVIGATOR FOR DRIVER */}
        {activeTrackingId && (
          <div className="mb-8 bg-gray-900 rounded-[2.5rem] p-6 shadow-2xl border border-white/10 overflow-hidden">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center animate-pulse">
                      <Truck className="text-white" size={20} />
                   </div>
                   <div>
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">Live Delivery Navigation</h4>
                      <p className="text-green-400 text-[10px] font-bold uppercase tracking-tighter">Broadcasting your location to Customer...</p>
                   </div>
                </div>
                <button 
                  onClick={() => setActiveTrackingId(null)}
                  className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all"
                >
                  Close Navigation
                </button>
             </div>
              <div className="h-96 w-full rounded-2xl overflow-hidden bg-gray-800 relative group">
                <div id="admin-live-map" className="absolute inset-0 z-0"></div>
                
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                
                <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row gap-3">
                   <a 
                     href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(deliveries.find(d => (d.deliveryId || d.id) === activeTrackingId)?.address || "")}&travelmode=driving`}
                     target="_blank"
                     className="flex-1 px-8 py-5 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-600/40 hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2 pointer-events-auto"
                   >
                      <MapPin size={18} /> Start Navigation
                   </a>
                   
                   <button 
                     onClick={() => {
                       const item = deliveries.find(d => (d.deliveryId || d.id) === activeTrackingId);
                       if (item) {
                         updateStatus(item, "Delivered");
                         setActiveTrackingId(null);
                       }
                     }}
                     className="flex-1 px-8 py-5 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-green-600/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 pointer-events-auto"
                   >
                      <CheckCircle size={18} /> Mark Delivered
                   </button>
                </div>

                <div className="absolute top-6 left-6 z-20 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white flex flex-col gap-1">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none">Destination</p>
                     <p className="text-[11px] font-black text-gray-900 uppercase truncate max-w-[200px]">
                        {deliveries.find(d => (d.deliveryId || d.id) === activeTrackingId)?.address || "Detecting..."}
                     </p>
                  </div>
                </div>

                <script dangerouslySetInnerHTML={{ __html: `
                  (function() {
                    if (typeof window === 'undefined') return;
                    
                    async function geocode(address) {
                      try {
                        const res = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(address));
                        const data = await res.json();
                        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                      } catch (e) { console.error("Geocode error", e); }
                      return null;
                    }

                    async function initAdminMap() {
                      if (!window.L) return setTimeout(initAdminMap, 200);
                      const mapId = 'admin-live-map';
                      const container = document.getElementById(mapId);
                      if (!container || container._leaflet_id) return;
                      
                      const startLat = 23.2599, startLng = 77.4126;
                      const map = L.map(mapId, { zoomControl: false }).setView([startLat, startLng], 14);
                      
                      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

                      const createIcon = (emoji, color) => L.divIcon({
                        className: 'adm-icon',
                        html: "<div style='background-color:"+color+"; width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 12px 20px -5px rgba(0,0,0,0.3); font-size:22px;'>"+emoji+"</div>",
                        iconAnchor: [21, 21]
                      });

                      const marker = L.marker([startLat, startLng], { icon: createIcon('🚚', '#10b981') }).addTo(map);
                      let routeLine = L.polyline([], { color: '#10b981', weight: 4, opacity: 0.5, dashArray: '8, 12' }).addTo(map);

                      const kPos = await geocode("${kitchenAddress}");
                      if (kPos) {
                        L.marker([kPos.lat, kPos.lon], { icon: createIcon('🏪', '#f59e0b') }).addTo(map);
                        const drawRoadRoute = async (from, to, mid) => {
                          try {
                            const mLat = mid.lat || mid.latitude;
                            const mLng = mid.lng || mid.longitude || mid.lon;
                            const url = \`https://router.project-osrm.org/route/v1/driving/\${from.lon},\${from.lat};\${mLng},\${mLat};\${to.lon},\${to.lat}?overview=full&geometries=geojson\`;
                            const res = await fetch(url);
                            const data = await res.json();
                            if (data.routes?.[0]) {
                              const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
                              routeLine.setLatLngs(coords);
                              return;
                            }
                          } catch (e) {}
                          routeLine.setLatLngs([[from.lat, from.lon], [mid.lat || mid.latitude, mid.lng || mid.lon], [to.lat, to.lon]]);
                        };

                        const targetAddress = "${deliveries.find(d => (d.deliveryId || d.id) === activeTrackingId)?.address || "Bhopal"}";
                        const hPos = await geocode(targetAddress);

                        if (hPos) {
                          L.marker([hPos.lat, hPos.lon], { icon: createIcon('🏠', '#1e293b') }).addTo(map);
                          drawRoadRoute(kPos, hPos, { lat: startLat, lng: startLng });
                          map.fitBounds(L.latLngBounds([[kPos.lat, kPos.lon], [startLat, startLng], [hPos.lat, hPos.lon]]), { padding: [40, 40] });
                        }

                        window._updateAdminMap = (lat, lng) => {
                          if (!marker) return;
                          marker.setLatLng([lat, lng]);
                          if (hPos) drawRoadRoute(kPos, hPos, { lat, lng });
                        };
                      }
                    }

                    if (!window.L) {
                      const link = document.createElement('link');
                      link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                      document.head.appendChild(link);
                      const script = document.createElement('script');
                      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                      script.onload = initAdminMap;
                      document.head.appendChild(script);
                    } else {
                      setTimeout(initAdminMap, 100);
                    }
                  })();
                `}} />
             </div>
             <AdminMapUpdater activeId={activeTrackingId} />
          </div>
        )}

        {/* LIST */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
           <div className="hidden md:block">
              <table className="w-full text-left">
                 <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Customer</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Meal Plan</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400">Address</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 text-right">Status / Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {filteredDeliveries.map((item) => (
                       <tr key={item.id} className={`${item.paused ? 'bg-red-50/30' : 'hover:bg-gray-50/50'} transition-all`}>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div>
                                   <div className="font-bold text-gray-900">{item.customerName}</div>
                                   <div className="text-xs text-gray-500">{item.phone}</div>
                                </div>
                                <a 
                                  href={`tel:${item.phone}`}
                                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  title="Call Customer"
                                >
                                   <Phone size={14} />
                                </a>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.type === 'Lunch' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                   {item.type}
                                </span>
                                {item.planType === "Both" && (
                                   <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-tighter">Both Plan</span>
                                )}
                                <div className="ml-2 flex flex-col">
                                   <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Remaining</span>
                                   <span className="text-xs font-black text-orange-600">{item.mealsLeft} Meals</span>
                                </div>
                             </div>
                          </td>
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-2 group">
                                 <span className="text-xs text-gray-600 max-w-[200px] truncate font-bold uppercase">{item.address}</span>
                                 <a 
                                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="p-1.5 rounded-lg bg-orange-50 text-orange-600 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-600 hover:text-white"
                                   title="Navigate to Address"
                                 >
                                    <MapPin size={14} />
                                 </a>
                              </div>
                           </td>
                          <td className="px-8 py-5 text-right">
                             {item.paused ? (
                                <div className="flex items-center justify-end gap-3 text-red-600 font-bold text-xs uppercase tracking-widest">
                                   ⏸️ Paused
                                </div>
                             ) : (
                                <div className="flex flex-wrap justify-end gap-2 items-center">
                                   {item.status === "Delivered" ? (
                                      <div className="flex items-center justify-end gap-2 text-green-600 font-black text-[10px] uppercase tracking-[0.2em] italic">
                                         <CheckCircle size={14} className="animate-bounce" />
                                         Delivered
                                      </div>
                                   ) : (
                                      <>
                                         {(item.status === "Scheduled" || item.status === "Pending") && (
                                            <button 
                                               onClick={() => updateStatus(item, "Prepared")}
                                               className="px-4 py-2.5 bg-amber-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-amber-600 transition-all shadow-md shadow-amber-100"
                                            >
                                               Mark Prepared
                                            </button>
                                         )}
                                         {item.status === "Prepared" && (
                                            <button 
                                               onClick={() => updateStatus(item, "Out for Delivery")}
                                               className="px-4 py-2.5 bg-blue-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-100"
                                            >
                                               Mark Dispatched
                                            </button>
                                         )}
                                         {item.status === "Out for Delivery" && (
                                            <div className="flex items-center gap-2">
                                               <button 
                                                  onClick={() => updateStatus(item, "Delivered")}
                                                  className="px-4 py-2.5 bg-green-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-green-700 transition-all shadow-md"
                                               >
                                                  Deliver
                                               </button>
                                               <button 
                                                  onClick={async () => {
                                                     const deliveryId = item.deliveryId || item.id;
                                                     if (item.status !== "Out for Delivery") await updateStatus(item, "Out for Delivery");
                                                     setActiveTrackingId(activeTrackingId === deliveryId ? null : deliveryId);
                                                  }}
                                                  className={`px-4 py-2.5 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-md animate-pulse ${
                                                    activeTrackingId === (item.deliveryId || item.id) ? 'bg-red-600' : 'bg-green-600'
                                                  }`}
                                               >
                                                  {activeTrackingId === (item.deliveryId || item.id) ? 'STOP GPS' : 'GO LIVE 📡'}
                                               </button>
                                            </div>
                                         )}
                                         <div className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase ml-2 select-none">{item.status}</div>
                                      </>
                                   )}
                                </div>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* MOBILE VIEW */}
           <div className="md:hidden divide-y divide-gray-100">
              {filteredDeliveries.map((item) => (
                 <div key={item.id} className={`p-6 ${item.paused ? 'bg-red-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <div className="font-bold text-gray-900">{item.customerName}</div>
                          <div className="text-xs text-gray-500">{item.phone}</div>
                       </div>
                       <div className="flex gap-2">
                          <a 
                            href={`tel:${item.phone}`}
                            className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center active:scale-95 shadow-sm"
                          >
                             <Phone size={18} />
                          </a>
                          <div className="flex flex-col items-end gap-1">
                             <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${item.type === 'Lunch' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>{item.type}</span>
                             {item.planType === "Both" && <span className="text-[7px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full uppercase">Both</span>}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                       <div className="text-xs text-gray-600 font-bold uppercase flex-1">📍 {item.address}</div>
                       <a 
                         href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100 active:scale-95"
                       >
                          <MapPin size={18} />
                       </a>
                    </div>
                    
                    {item.paused ? (
                        <div className="bg-red-100 text-red-600 p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest">
                           Service Paused Today
                        </div>
                    ) : item.status === "Delivered" ? (
                        <div className="bg-green-100 text-green-600 p-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] italic">
                           <CheckCircle size={14} />
                           Delivered Successfully
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                           <div className="flex flex-col gap-2">
                              {(item.status === "Scheduled" || item.status === "Pending" || item.status === "Confirmed") && (
                                 <button 
                                    onClick={() => updateStatus(item, "Prepared")}
                                    className="flex-1 py-4 bg-amber-500 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl shadow-amber-100"
                                 >
                                    Mark Prepared
                                 </button>
                               )}
                              {item.status === "Prepared" && (
                                 <button 
                                    onClick={() => updateStatus(item, "Out for Delivery")}
                                    className="flex-1 py-4 bg-blue-500 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl shadow-blue-100"
                                 >
                                    Mark Dispatched
                                 </button>
                              )}
                              {item.status === "Out for Delivery" && (
                                 <div className="flex flex-col gap-2 w-full">
                                    <button 
                                       onClick={() => updateStatus(item, "Delivered")}
                                       className="flex-1 py-4 bg-green-600 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl hover:bg-green-700"
                                    >
                                       Mark Delivered
                                    </button>
                                    <button 
                                       onClick={async () => {
                                          const deliveryId = item.deliveryId || item.id;
                                          if (item.status !== "Out for Delivery") await updateStatus(item, "Out for Delivery");
                                          setActiveTrackingId(activeTrackingId === deliveryId ? null : deliveryId);
                                       }}
                                       className={`flex-1 py-4 text-white text-[11px] font-black uppercase rounded-2xl shadow-xl animate-pulse ${
                                          activeTrackingId === (item.deliveryId || item.id) ? 'bg-red-600' : 'bg-green-600'
                                       }`}
                                    >
                                       {activeTrackingId === (item.deliveryId || item.id) ? '🛑 STOP LIVE GPS' : '📡 START LIVE PATH'}
                                    </button>
                                 </div>
                              )}
                           </div>
                           <div className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 border-t border-gray-100 pt-2">Current: {item.status}</div>
                        </div>
                    )}
                 </div>
              ))}
           </div>

           {filteredDeliveries.length === 0 && (
              <div className="py-24 text-center">
                 <div className="text-5xl mb-6 grayscale opacity-50 text-gray-300">📦</div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No orders in this list</p>
              </div>
           )}
        </div>

        <AnimatePresence>
          {isKitchenModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                 onClick={() => setIsKitchenModalOpen(false)}
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-8 sm:p-12 overflow-hidden border border-slate-100"
               >
                  <div className="flex items-center justify-between mb-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Setup Origin</p>
                        <h2 className="text-3xl font-black text-slate-900">Kitchen Details</h2>
                     </div>
                     <button onClick={() => setIsKitchenModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-all font-bold shadow-sm">✕</button>
                  </div>

                  <div className="space-y-6">
                      {!showMapPicker ? (
                        <>
                          <KitchenMapPicker 
                            onLocationSelect={(lat, lng, details) => {
                              setMapCoords({ lat, lng });
                              setKitchenForm({
                                hNo: details.hNo || kitchenForm.hNo,
                                pincode: details.pincode || kitchenForm.pincode,
                                colony: details.area || kitchenForm.colony,
                                area: details.area || kitchenForm.area,
                                city: details.city || kitchenForm.city,
                                state: details.state || kitchenForm.state
                              });
                              toast.success("Location Pin Dropped! 📍");
                            }} 
                          />

                          <button 
                             onClick={() => setShowMapPicker(true)} 
                             className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-orange-600 transition-all"
                          >
                             Review & confirm details
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">House/Shop No.</label>
                                <input value={kitchenForm.hNo} onChange={(e) => setKitchenForm({...kitchenForm, hNo: e.target.value})} placeholder="Ex: 12-B" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pincode</label>
                                <input value={kitchenForm.pincode} onChange={(e) => setKitchenForm({...kitchenForm, pincode: e.target.value})} placeholder="Ex: 462001" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Colony</label>
                                <input value={kitchenForm.colony} onChange={(e) => setKitchenForm({...kitchenForm, colony: e.target.value})} placeholder="Ex: Arera Colony" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Area / Road</label>
                                <input value={kitchenForm.area} onChange={(e) => setKitchenForm({...kitchenForm, area: e.target.value})} placeholder="Ex: Karond Choraha" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                                <input value={kitchenForm.city} onChange={(e) => setKitchenForm({...kitchenForm, city: e.target.value})} placeholder="Ex: Bhopal" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State</label>
                                <input value={kitchenForm.state} onChange={(e) => setKitchenForm({...kitchenForm, state: e.target.value})} placeholder="Ex: MP" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                             </div>
                          </div>
                          <button 
                             onClick={() => {
                                const addr = `${kitchenForm.hNo ? kitchenForm.hNo + ', ' : ''}${kitchenForm.colony ? kitchenForm.colony + ', ' : ''}${kitchenForm.area}, ${kitchenForm.city}, ${kitchenForm.state} - ${kitchenForm.pincode}`;
                                saveKitchenAddress(addr, mapCoords || undefined);
                             }}
                             disabled={savingKitchen}
                             className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all mt-4 shadow-2xl disabled:opacity-50 disabled:grayscale"
                           >
                              {savingKitchen ? "SAVING..." : "CONFIRM KITCHEN LOCATION"}
                           </button>
                           <button onClick={() => setShowMapPicker(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-orange-600 transition-all mt-4">← Back to Map</button>
                        </>
                      )}

                   </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const AdminMapUpdater = ({ activeId }: { activeId: string | null }) => {
  useEffect(() => {
    if (!activeId) return;

    let lastUpdate = 0;
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const now = Date.now();
        
        // Update local admin map instantly
        if ((window as any)._updateAdminMap) {
          (window as any)._updateAdminMap(latitude, longitude);
        }

        // Throttle API updates to every 5 seconds
        if (now - lastUpdate > 5000) {
          try {
            await fetch("/api/admin/delivery/update-location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                deliveryId: activeId,
                lat: latitude,
                lng: longitude
              })
            });
            lastUpdate = now;
          } catch (err) {
            console.error("Live update failed", err);
          }
        }
      },
      (error) => console.error("GPS Watch Error:", error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeId]);

  return null;
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className={`${color} p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20`}>
       <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">{title}</p>
       <h3 className="text-4xl font-black tracking-tight">{value}</h3>
    </div>
  );
}
