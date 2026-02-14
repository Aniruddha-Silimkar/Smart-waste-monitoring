// import { Header } from './components/Header';
// import { UploadSection } from './components/UploadSection';
// import { StatisticsPanel } from './components/StatisticsPanel';
// import { DustbinMap } from './components/DustbinMap';
// import { Toaster } from './components/ui/sonner';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
// import { BarChart3, Map, Upload } from 'lucide-react';
// import VJTIMap from "./components/VJTIMap";



// export default function App() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
//       <Header />
      
//       <main className="container mx-auto px-4 py-8">
//         <Tabs defaultValue="dashboard" className="w-full">
//           <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
//             <TabsTrigger value="dashboard" className="flex items-center gap-2">
//               <BarChart3 className="h-4 w-4" />
//               Dashboard
//             </TabsTrigger>
//             <TabsTrigger value="upload" className="flex items-center gap-2">
//               <Upload className="h-4 w-4" />
//               Upload
//             </TabsTrigger>
//             <TabsTrigger value="map" className="flex items-center gap-2">
//               <Map className="h-4 w-4" />
//               Map
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="dashboard" className="mt-6">
//             <StatisticsPanel />
//           </TabsContent>

//           <TabsContent value="upload" className="mt-6">
//             <div className="max-w-2xl mx-auto">
//               <UploadSection />
//             </div>
//           </TabsContent>

//           <TabsContent value="map" className="mt-6">
//             <DustbinMap />
//           </TabsContent>
//         </Tabs>
//       </main>

//       <Toaster />
//     </div>
//   );
// }


















import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { StatisticsPanel } from './components/StatisticsPanel';
import { DustbinMap } from './components/DustbinMap'; 
import VJTIMap from './components/VJTIMap';

import { Toaster } from './components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { BarChart3, Map, Upload } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <Header />
      
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>

            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>

            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="mt-6">
            <StatisticsPanel />
          </TabsContent>

          {/* Upload */}
          <TabsContent value="upload" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <UploadSection />
            </div>
          </TabsContent>

          {/* Map Tab - Showing Google Map */}
          <TabsContent value="map" className="mt-6">
            <div className="max-w-5xl mx-auto">
              <VJTIMap />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}
