import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Pin = { id: string; lat: number; lng: number; title: string; price?: string };

export function PropertyMap({ pins, height = 420 }: { pins: Pin[]; height?: number }) {
  const first = pins[0];
  const center: [number, number] = first ? [first.lat, first.lng] : [9.082, 8.6753]; // Nigeria center

  return (
    <div style={{ height }} className="overflow-hidden rounded-3xl ring-1 ring-black/5">
      <MapContainer center={center} zoom={first ? 11 : 6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
        />
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
            <Popup>
              <div className="min-w-[140px]">
                <p className="text-sm font-semibold">{p.title}</p>
                {p.price && <p className="text-xs opacity-70">{p.price}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
