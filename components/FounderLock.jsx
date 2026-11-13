"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Touch ID "founder mode" via WebAuthn platform authenticator.
// Honest scope: on a static site this is a recognition ritual, not security —
// it proves the person at the keyboard owns the enrolled fingerprint/passkey,
// but gates only a cosmetic panel. Credential id is stored per-domain.
const KEY = "artemis_founder_cred";

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export default function FounderLock() {
  const [supported, setSupported] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.PublicKeyCredential &&
      window.isSecureContext
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.().then(
        (ok) => setSupported(!!ok),
      );
    }
  }, []);

  const challenge = () => crypto.getRandomValues(new Uint8Array(32));

  async function touch() {
    setBusy(true);
    setErr("");
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) {
        await navigator.credentials.get({
          publicKey: {
            challenge: challenge(),
            allowCredentials: [{ type: "public-key", id: unb64(stored) }],
            userVerification: "required",
            timeout: 60000,
          },
        });
      } else {
        const cred = await navigator.credentials.create({
          publicKey: {
            challenge: challenge(),
            rp: { name: "Artemis Labs" },
            user: {
              id: crypto.getRandomValues(new Uint8Array(16)),
              name: "founder@artemislabs.bio",
              displayName: "Founder",
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 },
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        });
        localStorage.setItem(KEY, b64(cred.rawId));
      }
      setUnlocked(true);
    } catch {
      setErr("Touch ID declined");
      setTimeout(() => setErr(""), 2500);
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <div className="relative">
      <button
        onClick={unlocked ? () => setUnlocked(false) : touch}
        title={unlocked ? "Founder mode — click to lock" : "Founder login (Touch ID)"}
        aria-label="Founder login with Touch ID"
        className={`flex items-center justify-center h-9 w-9 rounded-full border transition-all ${
          unlocked
            ? "border-mint text-mint glow-ring"
            : "border-line text-dim hover:text-violet hover:border-violet/60"
        } ${busy ? "animate-pulse" : ""}`}
      >
        {/* fingerprint glyph */}
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M12 11c0 3.5-.5 6-1.5 8" />
          <path d="M15.5 10.5c0 4-.5 6.5-1 8.5" />
          <path d="M8.6 12.5c-.1 2.3-.4 4-1 5.5" />
          <path d="M5.5 10a6.5 6.5 0 0 1 13 .5" />
          <path d="M12 7.5a3.5 3.5 0 0 0-3.5 3.4" />
        </svg>
      </button>
      {err && (
        <span className="absolute top-11 right-0 whitespace-nowrap font-mono text-[11px] text-magma">{err}</span>
      )}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-12 right-0 z-50 w-64 rounded-2xl border border-line bg-panel/95 backdrop-blur p-4 text-left shadow-2xl"
          >
            <p className="font-mono text-[12px] text-mint mb-3">● founder mode</p>
            <div className="grid gap-2 text-[14px]">
              <a className="text-snow hover:text-violet transition-colors" href="https://github.com/logan196/artemislabs-site" target="_blank" rel="noreferrer">repo · artemislabs-site</a>
              <a className="text-snow hover:text-violet transition-colors" href="http://localhost:3456/" target="_blank" rel="noreferrer">local portal :3456</a>
              <a className="text-snow hover:text-violet transition-colors" href="https://logan196.github.io/artemislabs-site/" target="_blank" rel="noreferrer">live site</a>
              <p className="font-mono text-[11px] text-dim pt-1 border-t border-line">
                deploy: bash scripts/deploy-ghpages.sh
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
