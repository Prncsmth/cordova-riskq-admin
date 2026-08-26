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
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-5">
        {/* LEFT PANEL */}
        <section
          className="relative hidden overflow-hidden lg:col-span-2 lg:flex"
          style={{
            backgroundImage: "url('/images/mdrrmo.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 70%",
          }}
        >
          {/* Vignette instead of a flat wash — keeps the top/bottom text
              zones legible while letting the photo itself read clearly
              through the middle. */}
          <div className="absolute inset-0 bg-linear-to-t from-primary-dark/90 via-primary-dark/20 to-primary-dark/60" />

          <div className="relative z-10 flex h-full flex-col p-12 text-white">
            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-black/35 px-4 py-3 shadow-lg backdrop-blur-xl">
              <div className="relative h-11 w-11 shrink-0">
                <Image src="/images/logo.png" alt="" fill sizes="44px" className="object-contain" />
              </div>
              <div>
                <p className="text-base font-bold leading-tight tracking-wide">CORDOVA RISKQ</p>
                <p className="text-[10px] font-medium uppercase leading-tight tracking-wider text-white/70">
                  Geolocation Emergency Based and Assistance Coordination
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center">
              <div className="mb-6 h-1 w-12 rounded-full bg-white" />
              <h2 className="text-5xl font-bold leading-tight">
                Powered by
                <br />
                GEOLOCATION,
                <br />
                COORDINATION,
                <br />
                RESPONSE
              </h2>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex items-center justify-center p-6 lg:col-span-3 lg:p-10">
          <div className="w-full max-w-md rounded-3xl border border-border/70 bg-white p-8 shadow-xl sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-14 w-14">
                <Image src="/images/logo.png" alt="Cordova RISKQ" fill sizes="56px" className="object-contain" />
              </div>

              <h1 className="mt-4 text-2xl font-bold text-foreground">Administrator Login</h1>
              <p className="mt-1 text-sm text-muted">Sign in to the Cordova RISKQ admin portal.</p>
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
                  className="w-full rounded-xl border border-border bg-white py-3.5 pl-12 pr-4 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
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
                  className="w-full rounded-xl border border-border bg-white py-3.5 pl-12 pr-12 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-b from-primary to-primary-dark py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
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
