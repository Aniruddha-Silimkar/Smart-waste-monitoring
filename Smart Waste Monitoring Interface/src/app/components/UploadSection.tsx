import { useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function UploadSection() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dustbinNumber, setDustbinNumber] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = () => {
    if (!imagePreview || !dustbinNumber) {
      toast.error('Please upload an image and enter dustbin number');
      return;
    }
    toast.success(`Analyzing dustbin #${dustbinNumber}...`, {
      description: 'AI processing in progress',
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5 text-green-600" />
        Upload Dustbin Image
      </h2>
      
      <div className="space-y-4">
        {/* Image Upload Area */}
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
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="dustbin-image"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            >
              <Upload className="h-12 w-12 text-green-500 mb-2" />
              <p className="text-sm text-gray-600 mb-1">Click to upload dustbin image</p>
              <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
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

        {/* Dustbin Number Input */}
        <div>
          <Label htmlFor="dustbin-number" className="text-sm mb-2 block">
            Dustbin Number
          </Label>
          <Input
            id="dustbin-number"
            type="text"
            placeholder="e.g., DB-001"
            value={dustbinNumber}
            onChange={(e) => setDustbinNumber(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Analyze Dustbin
        </Button>
      </div>
    </Card>
  );
}
