import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2 } from "lucide-react";

// Fix default marker icons for bundlers
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom() ?? 13);
  }, [lat, lng, map]);
  return null;
}

function Clicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type Props = {
  lat: number | null;
  lng: number | null;
  address: string;
  onChange: (v: { lat: number; lng: number; address?: string }) => void;
};

export function LocationPicker({ lat, lng, address, onChange }: Props) {
  const [query, setQuery] = useState(address);
  const [searching, setSearching] = useState(false);
  const debounce = useRef<number | null>(null);

  useEffect(() => setQuery(address), [address]);

  async function geocode(q: string) {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q + ", Nigeria")}`,
        { headers: { Accept: "application/json" } },
      );
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      if (data[0]) {
        onChange({
          lat: Number(data[0].lat),
          lng: Number(data[0].lon),
          address: data[0].display_name.split(",").slice(0, 3).join(","),
        });
      }
    } catch {
      /* ignore */
    } finally {
      setSearching(false);
    }
  }

  function useCurrent() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const currentLat = lat ?? 6.5244; // default: Lagos
  const currentLng = lng ?? 3.3792;
  const hasPin = lat != null && lng != null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-2xl bg-navy-50 px-4 py-3">
        <MapPin className="size-4 text-navy-700" />
        <input
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            onChange({ lat: lat ?? currentLat, lng: lng ?? currentLng, address: v });
            if (debounce.current) window.clearTimeout(debounce.current);
            debounce.current = window.setTimeout(() => geocode(v), 700);
          }}
          placeholder="Lekki, Lagos or exact address"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {searching && <Loader2 className="size-4 animate-spin text-navy-700" />}
        <button
          type="button"
          onClick={useCurrent}
          className="rounded-full bg-navy-950 px-3 py-1 text-[11px] font-medium text-white"
        >
          Use current
        </button>
      </div>
      <div className="h-56 overflow-hidden rounded-2xl ring-1 ring-black/5">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
          />
          {hasPin && <Marker position={[currentLat, currentLng]} icon={icon} />}
          <Recenter lat={currentLat} lng={currentLng} />
          <Clicker onPick={(la, ln) => onChange({ lat: la, lng: ln })} />
        </MapContainer>
      </div>
      <p className="text-[11px] text-navy-700">
        {hasPin ? `Pinned at ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)} · tap map to move` : "Type an address, use current location, or tap the map to drop a pin."}
      </p>
    </div>
  );
}
