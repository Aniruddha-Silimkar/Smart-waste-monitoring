// import React from "react";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// const containerStyle = {
//   width: "100%",
//   height: "400px",
// };

// const vjtiLocation = {
//   lat: 19.0222,
//   lng: 72.8561,
// };

// const VJTIMap: React.FC = () => {
//   return (
//     <LoadScript
//       googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
//     >
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={vjtiLocation}
//         zoom={16}
//       >
//         <Marker position={vjtiLocation} />
//       </GoogleMap>
//     </LoadScript>
//   );
// };

// export default VJTIMap;

















// import React, { useEffect, useState } from "react";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   InfoWindow,
// } from "@react-google-maps/api";

// const containerStyle = {
//   width: "100%",
//   height: "400px",
// };

// const vjtiLocation = {
//   lat: 19.0222,
//   lng: 72.8561,
// };

// type Dustbin = {
//   id: number;
//   lat: number;
//   lng: number;
//   level: "empty" | "half" | "full";
// };

// const VJTIMap: React.FC = () => {
//   const [bins, setBins] = useState<Dustbin[]>([]);
//   const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null);

//   // Fetch data function
//   const fetchBins = () => {
//     // Replace this with backend API later
//     const dummyData: Dustbin[] = [
//       { id: 1, lat: 19.0222, lng: 72.8561, level: "empty" },
//       { id: 2, lat: 19.0217, lng: 72.8556, level: "half" },
//       { id: 3, lat: 19.0197, lng: 72.8559, level: "full" },
//       { id: 4, lat: 19.0209, lng: 72.8560, level: "empty" },
//       { id: 5, lat: 19.0226, lng: 72.8564, level: "full" },
//       { id: 6, lat: 19.0239, lng: 72.8568, level: "full" },
//     ]; 

//     setBins(dummyData);

//     // Alert if any bin is full
//     const fullBins = dummyData.filter((bin) => bin.level === "full");
//     if (fullBins.length > 0) {
//       console.log("Full bins:", fullBins);
//       alert(`⚠️ ${fullBins.length} dustbin(s) are FULL!`);
//     }
//   };

//   // Initial load + Auto refresh every 20 sec
//   useEffect(() => {
//     fetchBins();
//     const interval = setInterval(fetchBins, 200000);
//     return () => clearInterval(interval);
//   }, []);

//   // Marker color
//   const getIcon = (level: string) => {
//     if (level === "full") {
//       return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
//     }
//     if (level === "half") {
//       return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
//     }
//     return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
//   };

//   return (
//     <LoadScript
//       googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
//     >
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={vjtiLocation}
//         zoom={16}
//       >
//         {bins.map((bin) => (
//           <Marker
//             key={bin.id}
//             position={{ lat: bin.lat, lng: bin.lng }}
//             icon={getIcon(bin.level)}
//             onClick={() => setSelectedBin(bin)}
//           />
//         ))}

//         {/* Info Window on click */}
//         {selectedBin && (
//           <InfoWindow
//             position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
//             onCloseClick={() => setSelectedBin(null)}
//           >
//             <div>
//               <h4>Dustbin #{selectedBin.id}</h4>
//               <p>
//                 Status:{" "}
//                 <b
//                   style={{
//                     color:
//                       selectedBin.level === "full"
//                         ? "red"
//                         : selectedBin.level === "half"
//                         ? "orange"
//                         : "green",
//                   }}
//                 >
//                   {selectedBin.level.toUpperCase()}
//                 </b>
//               </p>
//             </div>
//           </InfoWindow>
//         )}
//       </GoogleMap>

//       return (
//   <LoadScript
//     googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
//   >
//     <div>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={vjtiLocation}
//         zoom={16}
//       >
//         {bins.map((bin) => (
//           <Marker
//             key={bin.id}
//             position={{ lat: bin.lat, lng: bin.lng }}
//             icon={getIcon(bin.level)}
//             onClick={() => setSelectedBin(bin)}
//           />
//         ))}

//         {selectedBin && (
//           <InfoWindow
//             position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
//             onCloseClick={() => setSelectedBin(null)}
//           >
//             <div>
//               <h4>Dustbin #{selectedBin.id}</h4>
//               <p>Status: {selectedBin.level.toUpperCase()}</p>
//             </div>
//           </InfoWindow>
//         )}
//       </GoogleMap>

//       {/* -------- Dustbin List Below Map -------- */}
//       <div style={{ marginTop: "20px" }}>
//         <h3>Dustbin Status</h3>

//         {bins.map((bin) => (
//           <div
//             key={bin.id}
//             style={{
//               padding: "10px",
//               marginBottom: "8px",
//               border: "1px solid #ddd",
//               borderRadius: "6px",
//               display: "flex",
//               justifyContent: "space-between",
//               background:
//                 bin.level === "full"
//                   ? "#ffe5e5"
//                   : bin.level === "half"
//                   ? "#fff8e1"
//                   : "#e8f5e9",
//             }}
//           >
//             <span>Dustbin #{bin.id}</span>

//             <span
//               style={{
//                 fontWeight: "bold",
//                 color:
//                   bin.level === "full"
//                     ? "red"
//                     : bin.level === "half"
//                     ? "orange"
//                     : "green",
//               }}
//             >
//               {bin.level.toUpperCase()}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   </LoadScript>
// );





//     </LoadScript>
//   );
// };

// export default VJTIMap;











































// import React, { useEffect, useState } from "react";
// import {
//   GoogleMap,
//   LoadScript,
//   Marker,
//   InfoWindow,
// } from "@react-google-maps/api";

// const containerStyle = {
//   width: "100%",
//   height: "400px",
// };

// const vjtiLocation = {
//   lat: 19.0222,
//   lng: 72.8561,
// };

// type Dustbin = {
//   id: number;
//   lat: number;
//   lng: number;
//   level: "empty" | "half" | "full";
// };

// const VJTIMap: React.FC = () => {
//   const [bins, setBins] = useState<Dustbin[]>([]);
//   const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null);

//   // Fetch dustbin data (dummy for now)
//   const fetchBins = () => {
//     const dummyData: Dustbin[] = [
//       { id: 1, lat: 19.0222, lng: 72.8561, level: "empty" },
//       { id: 2, lat: 19.0217, lng: 72.8556, level: "half" },
//       { id: 3, lat: 19.0197, lng: 72.8559, level: "full" },
//       { id: 4, lat: 19.0209, lng: 72.8560, level: "empty" },
//       { id: 5, lat: 19.0226, lng: 72.8564, level: "full" },
//       { id: 6, lat: 19.0239, lng: 72.8568, level: "half" },
//     ];

//     setBins(dummyData);

//     // Alert if any bin is full
//     const fullBins = dummyData.filter((bin) => bin.level === "full");
//     if (fullBins.length > 0) {
//       console.log("Full bins:", fullBins);
//     }
//   };

//   // Initial load + auto refresh every 20 sec
//   useEffect(() => {
//     fetchBins();
//     const interval = setInterval(fetchBins, 20000);
//     return () => clearInterval(interval);
//   }, []);

//   // Marker icon color
//   const getIcon = (level: string) => {
//     if (level === "full") {
//       return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
//     }
//     if (level === "half") {
//       return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
//     }
//     return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
//   };

//   return (
//     <LoadScript
//       googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
//     >
//       <div>
//         {/* -------- Map -------- */}
//         <GoogleMap
//           mapContainerStyle={containerStyle}
//           center={vjtiLocation}
//           zoom={16}
//         >
//           {bins.map((bin) => (
//             <Marker
//               key={bin.id}
//               position={{ lat: bin.lat, lng: bin.lng }}
//               icon={getIcon(bin.level)}
//               onClick={() => setSelectedBin(bin)}
//             />
//           ))}

//           {/* Info Window */}
//           {selectedBin && (
//             <InfoWindow
//               position={{ lat: selectedBin.lat, lng: selectedBin.lng }}
//               onCloseClick={() => setSelectedBin(null)}
//             >
//               <div>
//                 <h4>Dustbin #{selectedBin.id}</h4>
//                 <p>
//                   Status:{" "}
//                   <b
//                     style={{
//                       color:
//                         selectedBin.level === "full"
//                           ? "red"
//                           : selectedBin.level === "half"
//                           ? "orange"
//                           : "green",
//                     }}
//                   >
//                     {selectedBin.level.toUpperCase()}
//                   </b>
//                 </p>
//               </div>
//             </InfoWindow>
//           )}
//         </GoogleMap>

//         {/* -------- List Below Map -------- */}
//         <div style={{ marginTop: "20px" }}>
//           <h3>Dustbin Status</h3>

//           {bins.map((bin) => (
//             <div
//               key={bin.id}
//               style={{
//                 padding: "10px",
//                 marginBottom: "8px",
//                 border: "1px solid #ddd",
//                 borderRadius: "6px",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 background:
//                   bin.level === "full"
//                     ? "#ffe5e5"
//                     : bin.level === "half"
//                     ? "#fff8e1"
//                     : "#e8f5e9",
//               }}
//             >
//               <span>Dustbin #{bin.id}</span>

//               <span
//                 style={{
//                   fontWeight: "bold",
//                   color:
//                     bin.level === "full"
//                       ? "red"
//                       : bin.level === "half"
//                       ? "orange"
//                       : "green",
//                 }}
//               >
//                 {bin.level.toUpperCase()}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </LoadScript>
//   );
// };

// export default VJTIMap;


























































import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const vjtiLocation = {
  lat: 19.0222,
  lng: 72.8561,
};

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

  const handleUpdate = () => {
    fetchBins();
  };

  window.addEventListener("dustbin-updated", handleUpdate);

  return () => {
    window.removeEventListener("dustbin-updated", handleUpdate);
  };
}, []);







  // Marker color
const getIcon = (level: string) => {
  if (level === "full" || level === "overflowing") {
    return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
  }
  if (level === "half" || level === "half-full") {
    return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
  }
  return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
};


  // Format DB number
  const formatId = (id: number) => {
    return `DB-${id.toString().padStart(3, "0")}`;
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string}
    >
      <div>
        {/* -------- Map -------- */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={vjtiLocation}
          zoom={16}
        >
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
                  Status:{" "}
                  <b
                    style={{
                      color:
                        selectedBin.level === "full"
                          ? "red"
                          : selectedBin.level === "half"
                          ? "orange"
                          : "green",
                    }}
                  >
                    {selectedBin.percentage}% Full
                  </b>
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* -------- Activity List -------- */}
        <div style={{ marginTop: "20px" }}>
          <h3>Recent Dustbin Activity</h3>

          {bins.map((bin) => {
          const isFull = bin.level === "full" || bin.level === "overflowing";
          const isHalf = bin.level === "half" || bin.level === "half-full";


            const iconBg = isFull
              ? "#f44336"
              : isHalf
              ? "#ff9800"
              : "#4caf50";

            const statusText = isFull
              ? "Critical Level"
              : isHalf
              ? `${bin.percentage}% Full`
              : "Collected";

            return (
              <div
                key={bin.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  borderBottom: "1px solid #ddd",
                  background: "#fff",
                }}
              >
                {/* Status Icon */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    marginRight: "12px",
                    fontSize: "18px",
                  }}
                >
                  {isFull ? "!" : isHalf ? "⚠" : "✓"}
                </div>

                {/* Text */}
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {formatId(bin.id)} - {statusText}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {bin.updatedAt}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LoadScript>
  );
};

export default VJTIMap;















