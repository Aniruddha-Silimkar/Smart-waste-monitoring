import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:5000";

type AuthMode = "login" | "signup";

type AuthSuccessPayload = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

interface AuthSectionProps {
  onAuthSuccess: (payload: AuthSuccessPayload) => void;
}

export function AuthSection({ onAuthSuccess }: AuthSectionProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignup && !name)) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isSignup ? "/auth/signup" : "/auth/login";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      toast.success(isSignup ? "Account created successfully" : "Logged in successfully");
      onAuthSuccess(result);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-emerald-100/80 bg-white/92 p-7">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isSignup ? "Set up access for SmartWaste Monitor" : "Sign in to continue"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <Label htmlFor="name" className="mb-2 block text-sm text-slate-700">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 border-emerald-100 bg-white"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="mb-2 block text-sm text-slate-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-emerald-100 bg-white"
            />
          </div>

          <div>
            <Label htmlFor="password" className="mb-2 block text-sm text-slate-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isSignup ? "At least 6 characters" : "Enter your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-emerald-100 bg-white"
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(isSignup ? "login" : "signup")}
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </Card>
    </div>
  );
}
