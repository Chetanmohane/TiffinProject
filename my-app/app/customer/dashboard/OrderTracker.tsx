"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Home, Navigation, X } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  status: string;
  driverLocation?: { lat: number; lng: number } | null;
  kitchenAddress?: string;
  kitchenLocation?: { lat: number; lng: number };
  customerAddress?: string;
  eta?: string | null;
  onTabChange?: (tab: "Lunch" | "Dinner") => void;
  activeTab: "Lunch" | "Dinner";
  role?: string;
  orderId?: string | null;
  customerId?: string;
  onRefresh?: () => void;
}

// ─── Load Leaflet once, globally ─────────────────────────────────────────────
let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise<any>((resolve, reject) => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (document.getElementById("leaflet-js")) {
      // Script tag exists but L might not be ready yet — poll
      const wait = setInterval(() => {
        if ((window as any).L) { clearInterval(wait); resolve((window as any).L); }
      }, 80);
      return;
    }
    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve((window as any).L);
    script.onerror = () => reject(new Error("Leaflet load failed"));
    document.head.appendChild(script);
  });
  return leafletPromise;
}

// ─── Clean address before geocoding ──────────────────────────────────────────
function cleanAddress(addr: string): string {
  return addr
    .replace(/^[-~,\s]+/, "")   // strip leading dashes, tildes, commas
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Geocode via Nominatim with smart Indian address strategies ───────────────
async function geocode(raw: string): Promise<{ lat: number; lng: number } | null> {
  if (!raw?.trim()) return null;

  // Clean leading special chars (hyphens, tildes, commas)
  const addr = raw.replace(/^[-~,\s]+/, "").replace(/\s+/g, " ").trim();
  if (addr.length < 4) return null;

  // Extract pincode (6-digit Indian postal code)
  const pincodeMatch = addr.match(/\b(\d{6})\b/);
  const pincode = pincodeMatch?.[1];

  // Extract city hint (after last comma or known cities)
  const cityHint = addr.match(/\b(bhopal|indore|jabalpur|gwalior|ujjain)\b/i)?.[1] || "Bhopal";

  // Build progressive attempts — most specific first
  const attempts: Array<{ q?: string; street?: string; city?: string; postalcode?: string; state?: string; country?: string }> = [];

  // 1. Pincode + full address (most accurate for India)
  if (pincode) {
    attempts.push({ postalcode: pincode, country: "IN" });
    attempts.push({ q: addr, postalcode: pincode, country: "IN" });
  }

  // 2. Full address with city
  attempts.push({ q: addr + ", India" });

  // 3. Strip house number, keep area + city + pincode
  const withoutHouseNo = addr.replace(/^\d+[-\s]?[A-Z]?\s*/i, "").trim();
  if (withoutHouseNo !== addr) {
    attempts.push({ q: withoutHouseNo + ", India" });
  }

  // 4. Last 3 comma-parts + city hint
  const parts = addr.split(/,\s*/);
  if (parts.length > 2) {
    attempts.push({ q: parts.slice(-3).join(", ") + ", India" });
  }

  // 5. City-level fallback
  attempts.push({ q: cityHint + ", Madhya Pradesh, India" });

  for (const attempt of attempts) {
    try {
      let url: string;
      if (attempt.q && !attempt.postalcode) {
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(attempt.q)}&limit=1&countrycodes=in`;
      } else {
        // Structured query — more accurate
        const params = new URLSearchParams({ format: "json", limit: "1", countrycodes: "in" });
        if (attempt.q) params.set("q", attempt.q);
        if (attempt.postalcode) params.set("postalcode", attempt.postalcode);
        if (attempt.country) params.set("country", attempt.country);
        if (attempt.city) params.set("city", attempt.city);
        if (attempt.state) params.set("state", attempt.state);
        url = `https://nominatim.openstreetmap.org/search?${params}`;
      }

      const res = await fetch(url, {
        headers: { "Accept-Language": "en", "User-Agent": "TiffinApp/1.0" },
      });
      const data = await res.json();
      if (data?.[0]) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch {}
    // Brief pause between Nominatim calls to respect rate limits
    await new Promise(r => setTimeout(r, 200));
  }
  return null;
}


// ─── Fetch road route via OSRM ────────────────────────────────────────────────
async function fetchRoadRoute(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number
): Promise<{ coords: [number, number][]; mins: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data.routes?.[0]) {
      return {
        coords: data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]),
        mins: Math.ceil(data.routes[0].duration / 60),
      };
    }
  } catch {}
  return null;
}

export default function OrderTracker({
  status,
  driverLocation,
  kitchenLocation,
  kitchenAddress,
  customerAddress,
  eta,
  activeTab,
  onTabChange,
  role,
  orderId,
  customerId,
  onRefresh,
}: Props) {
  const [showMap, setShowMap] = useState(false);
  const [displayEta, setDisplayEta] = useState<number | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [homeResolved, setHomeResolved] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Refs — map objects
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const driverMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const homeMarkerRef = useRef<any>(null);
  const homePosRef = useRef<{ lat: number; lng: number } | null>(null);
  const prevDriverRef = useRef<{ lat: number; lng: number } | null>(null);
  const routeFetchingRef = useRef(false);
  const initRunningRef = useRef(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Keep latest prop values accessible inside async callbacks without stale closure
  const customerAddressRef = useRef(customerAddress);
  const driverLocationRef = useRef(driverLocation);
  const kitchenLocationRef = useRef(kitchenLocation);
  const kitchenAddressRef = useRef(kitchenAddress);
  useEffect(() => { customerAddressRef.current = customerAddress; }, [customerAddress]);
  useEffect(() => { driverLocationRef.current = driverLocation; }, [driverLocation]);
  useEffect(() => { kitchenLocationRef.current = kitchenLocation; }, [kitchenLocation]);
  useEffect(() => { kitchenAddressRef.current = kitchenAddress; }, [kitchenAddress]);

  const isLive = status === "Out for Delivery";

  // ── Auto-open map when Out for Delivery ──────────────────────────────────────
  useEffect(() => {
    if (isLive) setShowMap(true);
  }, [isLive]);

  // ── ETA props → countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (!eta) return;
    const n = parseInt(eta, 10);
    if (!isNaN(n) && n > 0) {
      setDisplayEta(n);
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setDisplayEta((p) => {
          if (p === null || p <= 1) { clearInterval(countdownRef.current!); return 0; }
          return p - 1;
        });
      }, 60_000);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [eta]);

  // ── Destroy map helper ────────────────────────────────────────────────────
  const destroyMap = () => {
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch {}
      mapRef.current = null;
    }
    driverMarkerRef.current = null;
    routeLineRef.current = null;
    homeMarkerRef.current = null;
    homePosRef.current = null;
    prevDriverRef.current = null;
    initRunningRef.current = false;
    setMapReady(false);
    setHomeResolved(false);
  };

  // ── Build map ─────────────────────────────────────────────────────────────
  const buildMap = async () => {
    if (initRunningRef.current) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) {
      mapRef.current.invalidateSize();
      return;
    }

    initRunningRef.current = true;
    setMapError(false);

    try {
      const L = await loadLeaflet();
      if (!mapContainerRef.current || mapRef.current) {
        initRunningRef.current = false;
        return;
      }

      // Read latest values from refs (avoids stale closure)
      const curDriverLoc = driverLocationRef.current;
      const curKitchenLoc = kitchenLocationRef.current;
      const curKitchenAddr = kitchenAddressRef.current;
      const curCustomerAddr = customerAddressRef.current;

      // ── Resolve kitchen / start pos ─────────────────────────────────────
      let kitchenPos: { lat: number; lng: number } | null = null;
      if (curKitchenLoc?.lat && curKitchenLoc.lat !== 0) {
        kitchenPos = curKitchenLoc;
      }
      if (!kitchenPos) {
        kitchenPos = await geocode(curKitchenAddr || "Bhopal, Madhya Pradesh");
      }
      const fallback = { lat: 23.2599, lng: 77.4126 };
      const startPos = curDriverLoc?.lat ? curDriverLoc : (kitchenPos ?? fallback);

      // ── Resolve home / customer address ────────────────────────────────
      let homePos: { lat: number; lng: number } | null = null;
      if (curCustomerAddr?.trim()) {
        homePos = await geocode(curCustomerAddr);
      }
      homePosRef.current = homePos;
      setHomeResolved(true);

      // ── Create map ────────────────────────────────────────────────────
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false,
        preferCanvas: true,
      }).setView([startPos.lat, startPos.lng], homePos ? 14 : 15);
      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      // ── Home icon (Blinkit / Swiggy style) ───────────────────────────
      const homeIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            display:flex;flex-direction:column;align-items:center;
            width:52px;
          ">
            <div style="
              background:white;width:52px;height:52px;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              border:3.5px solid #1e293b;
              box-shadow:0 6px 20px rgba(0,0,0,0.32);
            ">
              <div style="
                background:#f59e0b;width:38px;height:38px;border-radius:50%;
                display:flex;align-items:center;justify-content:center;
              ">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                     stroke="#1e293b" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
            </div>
            <div style="
              width:0;height:0;
              border-left:9px solid transparent;
              border-right:9px solid transparent;
              border-top:14px solid #1e293b;
              margin-top:-2px;
            "></div>
          </div>`,
        iconSize: [52, 68],
        iconAnchor: [26, 68],
      });

      // ── Bike / driver icon ────────────────────────────────────────────
      const bikeIcon = L.divIcon({
        className: "",
        html: `
          <div style="position:relative;width:56px;height:62px;">
            <div style="
              position:absolute;bottom:0;left:50%;transform:translateX(-50%);
              width:38px;height:7px;background:rgba(0,0,0,0.12);
              border-radius:50%;filter:blur(3px);
            "></div>
            <div style="
              background:#111827;width:56px;height:56px;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              border:3px solid white;
              box-shadow:0 8px 24px rgba(0,0,0,0.35);
            ">
              <img src="https://cdn-icons-png.flaticon.com/512/1048/1048329.png"
                   style="width:30px;height:30px;"
                   onerror="this.style.display='none';this.parentNode.innerHTML+='🛵'"/>
            </div>
          </div>`,
        iconSize: [56, 62],
        iconAnchor: [28, 31],
      });

      // ── Add home marker ───────────────────────────────────────────────
      if (homePos) {
        homeMarkerRef.current = L.marker(
          [homePos.lat, homePos.lng],
          { icon: homeIcon }
        ).addTo(map);
      }

      // ── Add driver marker ─────────────────────────────────────────────
      driverMarkerRef.current = L.marker(
        [startPos.lat, startPos.lng],
        { icon: bikeIcon, zIndexOffset: 1000 }
      ).addTo(map);

      // ── Draw route ────────────────────────────────────────────────────
      if (homePos) {
        const result = await fetchRoadRoute(
          startPos.lat, startPos.lng,
          homePos.lat, homePos.lng
        );
        if (result) {
          routeLineRef.current = L.polyline(result.coords, {
            color: "#2563eb", weight: 6, opacity: 0.9,
            lineCap: "round", lineJoin: "round",
          }).addTo(map);
          setDisplayEta(result.mins);
        } else {
          // Fallback dashed straight line
          routeLineRef.current = L.polyline(
            [[startPos.lat, startPos.lng], [homePos.lat, homePos.lng]],
            { color: "#2563eb", weight: 5, opacity: 0.65, dashArray: "12 10" }
          ).addTo(map);
        }
        // Fit both points in view
        map.fitBounds(
          L.latLngBounds([
            [startPos.lat, startPos.lng],
            [homePos.lat, homePos.lng],
          ]),
          { padding: [70, 70] }
        );
      }

      // Fix grey tiles after animation
      setTimeout(() => map.invalidateSize(), 250);
      setTimeout(() => map.invalidateSize(), 600);
      setMapReady(true);
    } catch (err) {
      console.error("Map build error:", err);
      setMapError(true);
    } finally {
      initRunningRef.current = false;
    }
  };

  // ── Show map → build (after Framer animation finishes) ───────────────────
  useEffect(() => {
    if (!showMap) return;
    const t = setTimeout(buildMap, 480);
    return () => clearTimeout(t);
  }, [showMap]); // eslint-disable-line

  // ── customerAddress changed while map is open → destroy + rebuild ─────────
  useEffect(() => {
    if (!showMap || !customerAddress?.trim()) return;
    // Only rebuild if home marker is missing (geocoding previously failed / was empty)
    if (homeMarkerRef.current) return; // already placed, skip
    if (initRunningRef.current) return;
    destroyMap();
    const t = setTimeout(buildMap, 300);
    return () => clearTimeout(t);
  }, [customerAddress, showMap]); // eslint-disable-line

  // ── Component unmount cleanup ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      destroyMap();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── Live driver position update (smooth interpolation) ───────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current || !driverMarkerRef.current) return;
    if (!driverLocation?.lat || !driverLocation?.lng) return;

    const prev = prevDriverRef.current;
    if (prev?.lat === driverLocation.lat && prev?.lng === driverLocation.lng) return;
    prevDriverRef.current = { ...driverLocation };

    // Glide marker smoothly (20 steps × 30ms = 600ms)
    const from = prev ?? driverLocation;
    let step = 0;
    const STEPS = 20;
    const timer = setInterval(() => {
      step++;
      const t = step / STEPS;
      driverMarkerRef.current?.setLatLng([
        from.lat + (driverLocation.lat - from.lat) * t,
        from.lng + (driverLocation.lng - from.lng) * t,
      ]);
      if (step >= STEPS) clearInterval(timer);
    }, 30);

    // Redraw route from new driver position
    const home = homePosRef.current;
    if (home && !routeFetchingRef.current) {
      routeFetchingRef.current = true;
      fetchRoadRoute(driverLocation.lat, driverLocation.lng, home.lat, home.lng).then((result) => {
        if (result) {
          if (routeLineRef.current) {
            routeLineRef.current.setLatLngs(result.coords);
          } else if (mapRef.current) {
            const L = (window as any).L;
            if (L) {
              routeLineRef.current = L.polyline(result.coords, {
                color: "#2563eb", weight: 6, opacity: 0.9,
                lineCap: "round", lineJoin: "round",
              }).addTo(mapRef.current);
            }
          }
          setDisplayEta(result.mins);
        }
        routeFetchingRef.current = false;
      });
    }
  }, [driverLocation, mapReady]);

  // ── Status update handler for Admin ──────────────────────────────────────
  const updateStatus = async (newStatus: string) => {
    if (!orderId && !customerId) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          customerId,
          status: newStatus,
          type: activeTab
        }),
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
        toast.success(`Marked as ${newStatus}`);
      } else {
        toast.error("Status update failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const steps = [
    { label: "Ordered", icon: "📝", status: "Scheduled" },
    { label: "Prepared", icon: "👨‍🍳", status: "Prepared" },
    { label: "Dispatched", icon: "🛵", status: "Out for Delivery" },
    { label: "Delivered", icon: "✅", status: "Delivered" },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === (status || "Scheduled"));
  const isAdmin = role === "admin" || role === "editor";

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">

      {/* ── HEADER ── */}
      <div className={`${isLive ? "bg-[#0b8a33]" : "bg-gray-900"} p-5 sm:p-6 text-white relative overflow-hidden transition-colors duration-500`}>
        {isLive && (
          <span className="absolute -top-6 -right-6 w-28 h-28 bg-white/5 rounded-full blur-2xl animate-pulse pointer-events-none" />
        )}

        <div className="relative flex items-center justify-between gap-3">
          {/* Left */}
          <div className="shrink-0">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="ml-0.5">Live</span>
              </span>
            ) : (
              <div className="flex gap-1.5">
                {(["Lunch", "Dinner"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => onTabChange?.(t)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === t ? "bg-white text-gray-900" : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center */}
          <div className="flex-1 text-center min-w-0">
            {isLive ? (
              <>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-0.5">
                  Order is on the way
                </p>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-none">
                  {displayEta !== null && displayEta > 0
                    ? `Arriving in ${displayEta} min${displayEta !== 1 ? "s" : ""}`
                    : displayEta === 0
                    ? "Arriving Now 🎉"
                    : "On the way..."}
                </h2>
              </>
            ) : (
              <>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-0.5">
                  {activeTab} Delivery
                </p>
                <h2 className="text-lg font-black tracking-tight leading-none">
                  {status || "Scheduled"}
                </h2>
              </>
            )}
          </div>

          {/* Right – toggle */}
          <button
            onClick={() => setShowMap((v) => !v)}
            className="shrink-0 flex items-center gap-1 px-3 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {showMap ? <X size={13} /> : <Navigation size={13} />}
            <span className="hidden sm:inline ml-1">{showMap ? "Close" : "Map"}</span>
          </button>
        </div>
      </div>

      {/* ── MAP / STATUS BODY ── */}
      <AnimatePresence mode="wait">
        {showMap ? (
          <motion.div
            key="map"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 440, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ position: "relative", overflow: "hidden" }}
          >
            {/* Leaflet container */}
            <div
              ref={mapContainerRef}
              style={{ position: "absolute", inset: 0, zIndex: 0 }}
            />

            {/* Loading spinner while geocoding */}
            {!mapReady && !mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-20 gap-3">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
                  Locating delivery address...
                </p>
              </div>
            )}

            {/* No home address warning */}
            {mapReady && homeResolved && !homePosRef.current && (
              <div className="absolute top-14 left-3 right-3 z-10">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-amber-500 text-sm">⚠️</span>
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">
                    Could not pinpoint delivery address on map
                  </p>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {mapError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-20 gap-3">
                <span className="text-4xl">🗺️</span>
                <p className="text-sm font-black text-gray-500 uppercase tracking-widest">
                  Map failed to load
                </p>
                <button
                  onClick={() => {
                    destroyMap();
                    setMapError(false);
                    setTimeout(buildMap, 100);
                  }}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Live badge top-left */}
            {isLive && mapReady && (
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-gray-100">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                  Live Tracking
                </span>
              </div>
            )}

            {/* Bottom info card */}
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <div className="bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-2xl border border-white/40 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg ${isLive ? "bg-green-600" : "bg-gray-700"}`}>
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">
                      Delivery Partner
                    </p>
                    <p className="text-sm font-black text-gray-900 leading-none">
                      {isLive ? "En Route 🛵" : "Not dispatched yet"}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-1 min-w-0">
                  <div className="flex items-center gap-1 justify-end mb-0.5">
                    <Home size={10} className="text-amber-500 shrink-0" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Delivery Address
                    </p>
                  </div>
                  <p className="text-[11px] font-bold text-gray-700 truncate text-right">
                    {cleanAddress(customerAddress || "") || "Address not set"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="p-6 sm:p-10 bg-slate-50">
              {/* Status Header */}
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all ${
                      isLive ? "bg-green-100 animate-bounce" : status === "Delivered" ? "bg-blue-100" : "bg-orange-100 shadow-orange-100/50"
                    }`}>
                      {isLive ? "🛵" : status === "Delivered" ? "✅" : status === "Prepared" ? "👨‍🍳" : "🍱"}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">
                        {activeTab} Delivery Status
                      </p>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-none">
                        {status || "Scheduled"}
                      </h3>
                    </div>
                 </div>

                 {/* Live Track Action - Top Right */}
                 {isLive && (
                    <button
                      onClick={() => setShowMap(true)}
                      className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gray-900 border-2 border-green-500/30 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-100/50 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Navigation size={13} className="text-green-400" />
                      Live Tracking
                    </button>
                 )}
              </div>

              {/* Progress Stepper */}
              <div className="relative mb-8 px-2">
                 <div className="absolute top-[18px] left-0 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                      className="h-full bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                    />
                 </div>
                 <div className="relative flex justify-between">
                    {steps.map((step, idx) => (
                       <div key={idx} className="flex flex-col items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-4 transition-all duration-500 z-10 ${
                             idx <= currentStepIndex 
                             ? "bg-orange-500 border-white text-white shadow-lg" 
                             : "bg-white border-gray-100 text-gray-300 shadow-sm"
                          }`}>
                             {idx <= currentStepIndex ? "✓" : (idx + 1)}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                             idx <= currentStepIndex ? "text-orange-600" : "text-gray-400"
                          }`}>{step.label}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="flex flex-col gap-4">
                 {/* Live Track Button - Big Mobile / Main */}
                 {isLive && (
                    <button
                      onClick={() => setShowMap(true)}
                      className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-green-500/20"
                    >
                      <div className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                      </div>
                      Track Your Tiffin Live 🗺️
                    </button>
                 )}

                  {status === "Out for Delivery" && displayEta !== null && (
                    <div className="p-5 bg-green-50 rounded-3xl border border-green-100 text-center">
                       <p className="text-xs font-bold text-gray-700">
                         Your delicious meal will arrive in approx{" "}
                         <span className="text-green-600 font-black text-sm">
                           {displayEta} min{displayEta !== 1 ? "s" : ""}
                         </span>
                       </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Tab Switcher - only if not live tracking */}
            {!isLive && (
              <div className="px-6 pb-6">
                <div className="flex items-center bg-gray-100 p-1 rounded-2xl">
                  {(["Lunch", "Dinner"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => onTabChange?.(tab)}
                      className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab ? "bg-white text-orange-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
