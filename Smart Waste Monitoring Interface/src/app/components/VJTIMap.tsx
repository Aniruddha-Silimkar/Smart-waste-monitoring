import React, { useEffect, useState } from "react";
import { GoogleMap, InfoWindow, LoadScript, Marker, OverlayView, Polyline } from "@react-google-maps/api";
import { MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "./ui/card";

const containerStyle = {
  width: "100%",
  height: "460px",
};

const vjtiLocation = {
  lat: 19.0222,
  lng: 72.8561,
};

const zoneDividerLines = [
  [
    { lat: 19.0262, lng: 72.8561 },
    { lat: 19.0182, lng: 72.8561 },
  ],
  [
    { lat: 19.0222, lng: 72.8523 },
    { lat: 19.0222, lng: 72.8597 },
  ],
];

const zoneLabels = [
  { name: "Zone A", position: { lat: 19.0242, lng: 72.8542 } },
  { name: "Zone B", position: { lat: 19.0242, lng: 72.8579 } },
  { name: "Zone C", position: { lat: 19.0202, lng: 72.8542 } },
  { name: "Zone D", position: { lat: 19.0202, lng: 72.8579 } },
];

type Dustbin = {
  id: number;
  lat: number;
  lng: number;
  level: "empty" | "half" | "half-full" | "full" | "overflowing";
  percentage: number;
  updatedAt: string;
};

const VJTIMap: React.FC = () => {
  const [bins, setBins] = useState<Dustbin[]>([]);
  const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null);

  const fetchBins = async () => {
    try {
      const res = await fetch("http://localhost:5000/dustbins");
      const data = await res.json();
      setBins(data);
    } catch (error) {
      console.error("Error fetching dustbins:", error);
    }
  };

  useEffect(() => {
    fetchBins();

    const handleUpdate = () => fetchBins();
    window.addEventListener("dustbin-updated", handleUpdate);

    return () => {
      window.removeEventListener("dustbin-updated", handleUpdate);
    };
  }, []);

  const getIcon = (level: string) => {
    if (level === "full" || level === "overflowing") return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (level === "half" || level === "half-full") return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  };

  const formatId = (id: number) => `DB-${id.toString().padStart(3, "0")}`;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">VJTI Dustbin Live Map</h2>
            <p className="text-sm text-slate-600">Track fill-level hotspots and recent updates</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="overflow-hidden rounded-2xl border border-emerald-100/80 shadow-sm">
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}>
            <GoogleMap mapContainerStyle={containerStyle} center={vjtiLocation} zoom={16}>
              {zoneDividerLines.map((path, index) => (
                <Polyline
                  key={`zone-divider-${index}`}
                  path={path}
                  options={{
                    strokeColor: "#0f766e",
                    strokeOpacity: 0.75,
                    strokeWeight: 1.5,
                    clickable: false,
                    zIndex: 1,
                  }}
                />
              ))}

              {zoneLabels.map((zone) => (
                <OverlayView
                  key={zone.name}
                  position={zone.position}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div className="rounded-md border border-emerald-300/90 bg-white/95 px-2 py-1 text-[11px] font-semibold text-emerald-800 shadow-sm">
                    {zone.name}
                  </div>
                </OverlayView>
              ))}

              {bins.map((bin) => (
                <Marker
                  key={bin.id}
                  position={{ lat: bin.lat, lng: bin.lng }}
                  icon={getIcon(bin.level)}
                  onClick={() => setSelectedBin(bin)}
                />
              ))}

              {selectedBin && (
                <InfoWindow
                  position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
                  onCloseClick={() => setSelectedBin(null)}
                >
                  <div>
                    <h4>{formatId(selectedBin.id)}</h4>
                    <p>
                      Status: <b>{selectedBin.percentage}% Full</b>
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-xs text-slate-500">Thin map lines indicate Zone A, B, C, and D boundaries.</p>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Recent Dustbin Activity</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {bins.map((bin) => {
              const isFull = bin.level === "full" || bin.level === "overflowing";
              const isHalf = bin.level === "half" || bin.level === "half-full";

              const statusText = isFull ? "Critical Level" : isHalf ? `${bin.percentage}% Full` : "Collected";
              const statusClass = isFull
                ? "border-rose-100 bg-rose-50/60 text-rose-700"
                : isHalf
                  ? "border-amber-100 bg-amber-50/70 text-amber-700"
                  : "border-emerald-100 bg-emerald-50/70 text-emerald-700";

              return (
                <div
                  key={bin.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/80 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{formatId(bin.id)}</p>
                    <p className="text-xs text-slate-500">{bin.updatedAt}</p>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                    {isFull || isHalf ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    {statusText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VJTIMap;
