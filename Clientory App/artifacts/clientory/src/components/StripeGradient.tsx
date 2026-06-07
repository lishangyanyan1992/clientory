import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
// Stripe's reverse-engineered animated WebGL gradient (Kevin Hufnagl), packaged.
import { Gradient } from "whatamesh";

/**
 * Full-bleed animated WebGL mesh gradient — the real Stripe hero shader.
 * Reads its four colors from the `--gradient-color-1..4` CSS custom properties
 * set on `#gradient-canvas` (see .stripe-landing #gradient-canvas in index.css).
 *
 * A static CSS gradient sits behind the canvas as a poster, so the hero looks
 * intentional before WebGL initializes, on unsupported devices, and when the
 * user prefers reduced motion (in which case the shader never starts).
 *
 * The shader is paused whenever the hero scrolls out of view or the tab is
 * hidden, so it doesn't burn GPU/CPU off-screen.
 */
export default function StripeGradient() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return; // honor prefers-reduced-motion: keep the static poster
    // whatamesh queries the DOM + uses WebGL/rAF, so it must run client-side only.
    const gradient = new Gradient() as {
      initGradient: (s: string) => void;
      play?: () => void;
      pause?: () => void;
    };
    gradient.initGradient("#gradient-canvas");

    const canvas = document.getElementById("gradient-canvas");
    let inView = true;
    const sync = () => {
      if (inView && !document.hidden) gradient.play?.();
      else gradient.pause?.();
    };

    let io: IntersectionObserver | undefined;
    if (canvas && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          inView = entries[entries.length - 1]?.isIntersecting ?? true;
          sync();
        },
        { threshold: 0 },
      );
      io.observe(canvas);
    }
    document.addEventListener("visibilitychange", sync);

    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      gradient.pause?.();
    };
  }, [reduce]);

  return (
    <>
      {/* Static brand-gradient poster (indigo → emerald) */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 10%, #6467f2 0%, rgba(100,103,242,0) 55%), radial-gradient(120% 90% at 85% 20%, #a5b4fc 0%, rgba(165,180,252,0) 50%), radial-gradient(120% 100% at 60% 100%, #10b780 0%, rgba(16,183,128,0) 55%), linear-gradient(180deg, #eef0ff 0%, #ffffff 100%)",
        }}
      />
      <canvas id="gradient-canvas" className="absolute inset-0 h-full w-full" />
    </>
  );
}
