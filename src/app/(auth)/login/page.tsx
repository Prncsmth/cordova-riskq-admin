"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* LEFT PANEL */}
        <section
          className="relative hidden overflow-hidden lg:flex"
          style={{
            background: "linear-gradient(155deg, var(--brand-cordova) 0%, #6e0d0d 45%, #17181a 100%)",
          }}
        >
          {/* Soft glow instead of a photo -- adds depth without needing a
              legibility scrim under the text, so the badge/pill below can
              sit directly on the gradient with no box around them. */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 h-[30rem] w-[30rem] rounded-full bg-black/30 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col p-12 text-white">
            <div className="inline-flex w-fit items-center gap-3">
              <div className="relative h-11 w-11 shrink-0">
                <Image src="/images/logo.png" alt="" fill sizes="44px" className="object-contain" priority />
              </div>
              <div>
                <p className="text-base font-bold leading-tight tracking-wide">CORDOVA RISKQ</p>
                <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-white/70">
                  Geolocation-Based Emergency and Assistance Coordination
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-6 h-1 w-12 rounded-full bg-white" />
              <h2 className="text-4xl font-bold leading-tight tracking-tight">
                Coordinated emergency
                <br />
                response for Cordova,
                <br />
                Cebu.
              </h2>
              <p className="mt-4 max-w-sm text-sm text-white/70">
                Real-time monitoring, dispatch, and incident coordination for
                the Municipal Disaster Risk Reduction and Management Office.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              MDRRMO &middot; Cordova, Cebu
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md rounded-3xl border border-border/70 bg-surface p-8 shadow-lg sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-14 w-14">
                <Image src="/images/logo.png" alt="Cordova RISKQ" fill sizes="56px" className="object-contain" priority />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-foreground">Administrator Login</h1>
              <p className="mt-1 text-sm text-text-tertiary">Sign in to the Cordova RISKQ admin portal.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-sm font-medium text-danger">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-border bg-input-bg py-3.5 pl-12 pr-4 text-sm text-foreground shadow-xs outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/15"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-border bg-input-bg py-3.5 pl-12 pr-12 text-sm text-foreground shadow-xs outline-none transition-all duration-200 focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Remember me
                </label>

                <button type="button" className="font-medium text-primary hover:text-primary-dark">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
