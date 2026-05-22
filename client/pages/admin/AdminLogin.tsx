import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("devdale_token");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all security fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Save tokens
      localStorage.setItem("devdale_token", data.accessToken);
      localStorage.setItem("devdale_refresh", data.refreshToken);
      localStorage.setItem("devdale_user", JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user.name}`);
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Invalid security credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center px-6 relative overflow-hidden selection:bg-white selection:text-black">
      {/* Background blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-zinc-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-zinc-900/15 rounded-full blur-[120px] pointer-events-none" />

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Branding header */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-4 backdrop-blur-md">
            <Shield className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase flex items-center justify-center gap-2">
            DEVDALE <span className="text-xs px-2 py-0.5 border border-zinc-700 bg-zinc-900 text-zinc-400 rounded">AGENCY OS</span>
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-semibold">
            Operational Security Gateway
          </p>
        </div>

        {/* Credentials form */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">
                OPERATIONAL SECURITY EMAIL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="admin@devdale.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold">
                  CREDENTIAL PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Please contact operations manager to reset.")}
                  className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> VERIFYING ACCESS...
                </>
              ) : (
                <>
                  AUTHENTICATE SECURE SESSION <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-8 text-zinc-600 text-[11px] font-semibold tracking-wider uppercase">
          SECURE CONNECTION ENCRYPTED • AES-256 SSL
        </div>
      </m.div>
    </div>
  );
}
