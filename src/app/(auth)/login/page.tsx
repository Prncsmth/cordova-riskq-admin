"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
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
    <main className="relative flex min-h-screen overflow-hidden bg-background">
      {/* LEFT HERO — campaign poster. The panel is a bit wider than the square
          poster, so cover-scaling crops from the bottom (object-top keeps the
          logo and headline); max-w caps how much gets cropped on short,
          wide screens. */}
      <section className="relative hidden h-screen w-[62%] max-w-[120vh] shrink-0 overflow-hidden lg:block">
        <Image
          src="/images/login-hero-v3.webp"
          alt="Cordova RISKQ — Geolocation-based emergency response for Cordova, Cebu. A real-time platform for monitoring incidents, dispatching responders, and coordinating emergency operations."
          fill
          sizes="62vw"
          priority
          className="object-cover object-left-top"
        />
      </section>

      {/* Soft red wave in the bottom-right of the light side */}
      <div
        className="pointer-events-none absolute -bottom-48 -right-48 h-[32rem] w-[52rem] rounded-[50%]"
        style={{ background: "radial-gradient(closest-side, rgba(200,16,46,0.12), transparent)" }}
      />

      {/* LOGIN CARD */}
      <section className="relative z-10 flex min-h-screen flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md rounded-3xl border border-border/70 bg-surface p-8 shadow-xl sm:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-20 w-20">
              <Image src="/images/logo.png" alt="Cordova RISKQ" fill sizes="80px" className="object-contain" priority />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-foreground sm:text-[28px]">Administrator Login</h1>
            <p className="mt-2 text-sm text-muted">Sign in to the Cordova RISKQ admin portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-sm font-medium text-danger">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-foreground/80" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-2xl border border-border bg-surface py-4 pl-14 pr-4 text-sm text-foreground shadow-xs outline-none transition-all duration-200 placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-foreground/80" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-border bg-surface py-4 pl-14 pr-14 text-sm text-foreground shadow-xs outline-none transition-all duration-200 placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/80 transition hover:text-foreground"
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-[0_10px_24px_-8px_rgba(200,16,46,0.6)] transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
