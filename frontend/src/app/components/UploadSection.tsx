import { useState } from "react";
import { Upload, Camera, X, Loader2, CircleCheckBig, TriangleAlert, Lock, LogIn } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { API_BASE_URL } from "../lib/api";

interface UploadSectionProps {
  user?: { name: string; role: "user" | "admin" } | null;
  onOpenAuth?: () => void;
}

export function UploadSection({ user, onOpenAuth }: UploadSectionProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dustbinNumber, setDustbinNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Please log in to upload dustbin images");
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to upload dustbin images");
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!selectedFile || !dustbinNumber) {
      toast.error("Please upload an image and enter dustbin number");
      return;
    }

    let processingToastId: string | number | undefined;

    try {
      setLoading(true);
      processingToastId = toast.loading(
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-white" />
          <div>
            <p className="text-base font-bold text-white">Processing image...</p>
            <p className="text-sm text-emerald-100">Sending file to AI model and analyzing fill level</p>
          </div>
        </div>,
        {
          duration: 12000,
          style: {
            background: "linear-gradient(135deg, #0f766e 0%, #0e9f6e 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "16px",
            borderRadius: "14px",
            boxShadow: "0 16px 30px -14px rgba(0, 59, 46, 0.85)",
            minWidth: "350px",
          },
        },
      );

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("dustbinId", dustbinNumber);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      toast.success(
        <div className="flex items-start gap-3">
          <CircleCheckBig className="mt-0.5 h-5 w-5 text-white" />
          <div>
            <p className="text-base font-bold text-white">Dustbin {dustbinNumber} updated</p>
            <p className="text-sm text-emerald-100">
              Status: {result.data.level.toUpperCase()} ({result.data.percentage}%)
            </p>
          </div>
        </div>,
        {
          id: processingToastId,
          duration: 5500,
          style: {
            background: "linear-gradient(135deg, #047857 0%, #059669 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.28)",
            padding: "16px",
            borderRadius: "14px",
            boxShadow: "0 16px 30px -14px rgba(0, 59, 46, 0.85)",
            minWidth: "350px",
          },
        },
      );

      window.dispatchEvent(new Event("dustbin-updated"));
      clearImage();
      setDustbinNumber("");
    } catch (error) {
      console.error(error);
      toast.error(
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 text-white" />
          <div>
            <p className="text-base font-bold text-white">Upload failed</p>
            <p className="text-sm text-rose-100">Check backend and Python model server</p>
          </div>
        </div>,
        {
          duration: 6000,
          style: {
            background: "linear-gradient(135deg, #be123c 0%, #e11d48 100%)",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "16px",
            borderRadius: "14px",
            boxShadow: "0 16px 30px -14px rgba(136, 19, 55, 0.8)",
            minWidth: "350px",
          },
        },
      );
      if (processingToastId !== undefined) {
        toast.dismiss(processingToastId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-emerald-100/70 bg-white/86 p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Upload Dustbin Image</h2>
            <p className="text-sm text-slate-600">Add a fresh dustbin image to update fill status</p>
          </div>
        </div>
      </div>

      {!user && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-200/70 p-2 text-amber-800 shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Login required to upload images</p>
              <p className="text-xs text-amber-700">You are browsing as a guest. Please log in to submit dustbin updates.</p>
            </div>
          </div>
          <Button onClick={onOpenAuth} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 gap-1.5 font-medium shadow-xs">
            <LogIn className="h-4 w-4" />
            Log In to Upload
          </Button>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <Label htmlFor="dustbin-image" className="mb-2 block text-sm text-slate-700">
            Dustbin Photo
          </Label>

          {imagePreview ? (
            <div className="relative overflow-hidden rounded-2xl border border-emerald-100 shadow-sm">
              <img src={imagePreview} alt="Dustbin preview" className="h-64 w-full object-cover sm:h-72" />
              <button
                onClick={clearImage}
                className="absolute right-3 top-3 rounded-full bg-slate-900/70 p-2 text-white transition hover:bg-slate-900"
                aria-label="Remove selected image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="dustbin-image"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  toast.error("Please log in to upload dustbin images");
                  if (onOpenAuth) onOpenAuth();
                }
              }}
              className="group flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50"
            >
              <div className="mb-3 rounded-2xl bg-emerald-100 p-3 text-emerald-700 transition group-hover:bg-emerald-200">
                <Upload className="h-7 w-7" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {user ? "Click to upload an image" : "Sign in to upload an image"}
              </p>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG up to 10MB</p>
              <input
                id="dustbin-image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={!user}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <Label htmlFor="dustbin-number" className="mb-2 block text-sm text-slate-700">
            Dustbin ID
          </Label>
          <Input
            id="dustbin-number"
            type="number"
            placeholder="Enter Dustbin ID (e.g., 3)"
            value={dustbinNumber}
            onChange={(e) => setDustbinNumber(e.target.value)}
            disabled={!user}
            className="h-11 border-emerald-100 bg-white"
          />
        </div>

        {user ? (
          <Button onClick={handleSubmit} disabled={loading} className="h-11 w-full text-sm">
            {loading ? "Analyzing..." : "Analyze Dustbin"}
          </Button>
        ) : (
          <Button onClick={onOpenAuth} className="h-11 w-full text-sm bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium">
            <LogIn className="h-4 w-4" />
            Log In to Analyze Dustbin
          </Button>
        )}
      </div>
    </Card>
  );
}
