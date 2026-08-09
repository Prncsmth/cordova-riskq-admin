"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  Shield,  
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      localStorage.setItem("riskq_admin_authenticated", "true");
      router.push("/dashboard");
    }, 800);
  }

  return (
    <main className="min-h-screen bg-primary-dark">

      <div className="grid min-h-screen lg:grid-cols-5">

        {/* LEFT PANEL */}

        <section
          className="relative hidden lg:flex lg:col-span-2 overflow-hidden"
          style={{
            backgroundImage: "url('/images/cordova-hall.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          
        >
          
          {/* Overlay */}

          <div className="absolute inset-0 bg-linear-to-r from-primary-dark/95 via-primary/80 to-primary-dark/95" />

          {/* Watermark */}

          <Image
            src="/images/cordova-logo.png"
            alt=""
            fill
            className="object-contain opacity-10 scale-125"
          />

          <div className="relative z-10 flex flex-col justify-between p-12 text-white">

            <div />

            <div>

              <div className="w-12 h-1 bg-white rounded-full mb-6" />

              <h2 className="text-5xl font-bold leading-tight">

                Serving with

                <br />

                <span className="text-white">
                  PRIDE,
                  <br />
                  DUTY,
                  <br />
                  COMPASSION
                </span>

              </h2>

            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-6">

              <h3 className="font-semibold">
                Emergency Operations
              </h3>

              <p className="text-white/70">
                Always Ready. Always Here.
              </p>

            </div>

          </div>

        </section>

        {/* RIGHT PANEL */}

        <section className="flex items-center justify-center bg-linear-to-r from-white via-gray-50 to-white p-10 lg:col-span-3">

          <div className="w-full max-w-xl rounded-[36px] bg-white p-12 shadow-2xl">

            {/* Logos */}


            <div className="my-10 border-t" />

            <h2 className="text-center text-3xl font-bold">
              Administrator Login
            </h2>

            <p className="text-center text-gray-500 mt-2 mb-8">
              Please sign in to continue.
            </p>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="relative">

                <Mail
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full rounded-xl border border-border pl-12 pr-4 py-4 outline-none focus:border-primary"
                />

              </div>

              <div className="relative">

                <Lock
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-xl border border-border pl-12 pr-12 py-4 outline-none focus:border-primary"
                />

                <Eye
                  className="absolute right-4 top-4 text-gray-400"
                  size={20}
                />

              </div>

              <div className="flex justify-between text-sm">

                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  Remember me
                </label>

              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-linear-to-r from-primary to-primary-dark py-4 text-lg font-bold text-white shadow-lg hover:scale-[1.02] transition disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

            </form>

            <div className="mt-10 flex items-center justify-center gap-2 text-gray-500">

              <Shield size={18} />

              Secure Access

            </div>

            <p className="mt-4 text-center text-sm text-gray-400">
              Cordova RiskQ Admin Portal
              <br />
              Version 1.0.0
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}