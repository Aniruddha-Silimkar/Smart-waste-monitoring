// import { useState } from 'react';
// import { Upload, Camera, X } from 'lucide-react';
// import { Card } from './ui/card';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Button } from './ui/button';
// import { toast } from 'sonner';

// export function UploadSection() {
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [dustbinNumber, setDustbinNumber] = useState('');

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const clearImage = () => {
//     setImagePreview(null);
//   };

//   const handleSubmit = () => {
//     if (!imagePreview || !dustbinNumber) {
//       toast.error('Please upload an image and enter dustbin number');
//       return;
//     }
//     toast.success(`Analyzing dustbin #${dustbinNumber}...`, {
//       description: 'AI processing in progress',
//     });
//   };

//   return (
//     <Card className="p-6">
//       <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
//         <Camera className="h-5 w-5 text-green-600" />
//         Upload Dustbin Image
//       </h2>
      
//       <div className="space-y-4">
//         {/* Image Upload Area */}
//         <div>
//           <Label htmlFor="dustbin-image" className="text-sm mb-2 block">
//             Dustbin Photo
//           </Label>
//           {imagePreview ? (
//             <div className="relative">
//               <img
//                 src={imagePreview}
//                 alt="Dustbin preview"
//                 className="w-full h-64 object-cover rounded-lg border-2 border-green-200"
//               />
//               <button
//                 onClick={clearImage}
//                 className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           ) : (
//             <label
//               htmlFor="dustbin-image"
//               className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
//             >
//               <Upload className="h-12 w-12 text-green-500 mb-2" />
//               <p className="text-sm text-gray-600 mb-1">Click to upload dustbin image</p>
//               <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
//               <input
//                 id="dustbin-image"
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageUpload}
//                 className="hidden"
//               />
//             </label>
//           )}
//         </div>

//         {/* Dustbin Number Input */}
//         <div>
//           <Label htmlFor="dustbin-number" className="text-sm mb-2 block">
//             Dustbin Number
//           </Label>
//           <Input
//             id="dustbin-number"
//             type="text"
//             placeholder="e.g., DB-001"
//             value={dustbinNumber}
//             onChange={(e) => setDustbinNumber(e.target.value)}
//             className="w-full"
//           />
//         </div>

//         {/* Submit Button */}
//         <Button
//           onClick={handleSubmit}
//           className="w-full bg-green-600 hover:bg-green-700"
//         >
//           Analyze Dustbin
//         </Button>
//       </div>
//     </Card>
//   );
// }













import { useState } from "react";
import { Upload, Camera, X } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function UploadSection() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dustbinNumber, setDustbinNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle image select
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  // Submit to backend
  const handleSubmit = async () => {
    if (!selectedFile || !dustbinNumber) {
      toast.error("Please upload an image and enter dustbin number");
      return;
    }

    try {
      setLoading(true);

      // toast("Uploading...", {
      //   description: "Sending image to AI model",
      // });
      toast(
  <div>
    <div style={{ fontWeight: 600, fontSize: "16px" }}>
      Uploading...
    </div>
    <div style={{ color: "#374151", marginTop: "4px", fontSize: "14px" }}>
      Sending image to AI model
    </div>
  </div>,
  {
    style: {
      background: "#ffffff",
      padding: "16px",
      borderRadius: "10px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    },
    duration: 2000,
  }
);


      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("dustbinId", dustbinNumber);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      // toast.success(`Dustbin ${dustbinNumber} Updated`, {
      //   description: `Status: ${result.data.level.toUpperCase()} (${result.data.percentage}%)`,
      // });

      toast.success(
  <div>
    <div style={{ fontSize: "18px", fontWeight: 700 }}>
      Dustbin {dustbinNumber} Updated
    </div>
    <div style={{ fontSize: "14px", marginTop: "4px" }}>
      Status: {result.data.level.toUpperCase()} ({result.data.percentage}%)
    </div>
  </div>,
  {
    style: {
      background: "#16a34a",
      color: "#fff",
      padding: "16px",
      borderRadius: "10px",
      boxShadow: "0 6px 20px rgba(0,0,0,0.2)"
    },
    duration: 4000
  }
);



      window.dispatchEvent(new Event("dustbin-updated"));


      // Reset
      setImagePreview(null);
      setSelectedFile(null);
      setDustbinNumber("");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed", {
        description: "Check backend or Python server",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5 text-green-600" />
        Upload Dustbin Image
      </h2>

      <div className="space-y-4">
        {/* Image Upload */}
        <div>
          <Label htmlFor="dustbin-image" className="text-sm mb-2 block">
            Dustbin Photo
          </Label>

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Dustbin preview"
                className="w-full h-64 object-cover rounded-lg border-2 border-green-200"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="dustbin-image"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50"
            >
              <Upload className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-sm text-gray-600">Click to upload image</p>
              <input
                id="dustbin-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Dustbin ID */}
        <div>
          <Label htmlFor="dustbin-number" className="text-sm mb-2 block">
            Dustbin ID
          </Label>
          <Input
            id="dustbin-number"
            type="number"
            placeholder="Enter Dustbin ID (e.g., 3)"
            value={dustbinNumber}
            onChange={(e) => setDustbinNumber(e.target.value)}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {loading ? "Analyzing..." : "Analyze Dustbin"}
        </Button>
      </div>
    </Card>
  );
}













































