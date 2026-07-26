import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Card } from './ui/card';
import { MapPin, Trash2, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

// VJTI College, Matunga coordinates
const VJTI_CENTER = { lat: 19.0238, lng: 72.8550 };

// Random dustbin locations around VJTI campus
const dustbinLocations = [
  { id: 'DB-001', lat: 19.0245, lng: 72.8545, status: 'normal', fillLevel: 45 },
  { id: 'DB-007', lat: 19.0230, lng: 72.8555, status: 'normal', fillLevel: 52 },
  { id: 'DB-015', lat: 19.0240, lng: 72.8560, status: 'attention', fillLevel: 85 },
  { id: 'DB-023', lat: 19.0235, lng: 72.8540, status: 'normal', fillLevel: 38 },
  { id: 'DB-031', lat: 19.0250, lng: 72.8550, status: 'normal', fillLevel: 60 },
  { id: 'DB-042', lat: 19.0228, lng: 72.8548, status: 'critical', fillLevel: 95 },
  { id: 'DB-056', lat: 19.0242, lng: 72.8552, status: 'attention', fillLevel: 78 },
  { id: 'DB-063', lat: 19.0232, lng: 72.8558, status: 'normal', fillLevel: 42 },
];

function getMarkerColor(status: string) {
  switch (status) {
    case 'critical':
      return 'bg-red-500';
    case 'attention':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
}

interface CustomMarkerProps {
  status: string;
  id: string;
}

function CustomMarker({ status, id }: CustomMarkerProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div className={`${getMarkerColor(status)} w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center`}>
        <Trash2 className="w-4 h-4 text-white" />
      </div>
      <div className="absolute -bottom-6 bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap">
        {id}
      </div>
    </div>
  );
}

export function DustbinMap() {
  // Check if API key is configured
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const hasValidKey = GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';

  const mapContent = useMemo(() => {
    if (!hasValidKey) {
      return (
        <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Google Maps API Key Required</h3>
          <p className="text-gray-600 mb-4 max-w-md">
            To display the interactive map, please add your Google Maps API key to the environment variables.
          </p>
          <div className="bg-gray-50 p-4 rounded border border-gray-300 text-left text-sm font-mono max-w-lg">
            <p className="text-gray-500 mb-2">Add to .env file:</p>
            <p className="text-gray-700">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</p>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
            {dustbinLocations.map((dustbin) => (
              <div
                key={dustbin.id}
                className={`p-3 rounded-lg border-2 ${
                  dustbin.status === 'critical' ? 'border-red-300 bg-red-50' :
                  dustbin.status === 'attention' ? 'border-yellow-300 bg-yellow-50' :
                  'border-green-300 bg-green-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 className={`w-4 h-4 ${
                    dustbin.status === 'critical' ? 'text-red-600' :
                    dustbin.status === 'attention' ? 'text-yellow-600' :
                    'text-green-600'
                  }`} />
                  <p className="font-medium text-sm">{dustbin.id}</p>
                </div>
                <p className="text-xs text-gray-600">{dustbin.fillLevel}% full</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: '500px' }}
          defaultCenter={VJTI_CENTER}
          defaultZoom={17}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          {dustbinLocations.map((dustbin) => (
            <AdvancedMarker
              key={dustbin.id}
              position={{ lat: dustbin.lat, lng: dustbin.lng }}
            >
              <CustomMarker status={dustbin.status} id={dustbin.id} />
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    );
  }, [hasValidKey]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-green-600" />
        Dustbin Locations - VJTI College, Matunga
      </h2>
      
      <div className="rounded-lg overflow-hidden border-2 border-gray-200">
        {mapContent}
      </div>

      {hasValidKey && (
        <>
          {/* Map Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Normal (&lt;70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Attention (70-90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Critical (&gt;90%)</span>
            </div>
          </div>

          {/* Dustbin List */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {dustbinLocations.map((dustbin) => (
              <div
                key={dustbin.id}
                className="p-2 bg-gray-50 rounded-lg text-center text-sm"
              >
                <p className="font-medium">{dustbin.id}</p>
                <p className="text-xs text-gray-500">{dustbin.fillLevel}% full</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
