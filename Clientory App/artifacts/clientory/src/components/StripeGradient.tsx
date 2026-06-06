import { useEffect } from "react";
// Stripe's reverse-engineered animated WebGL gradient (Kevin Hufnagl), packaged.
import { Gradient } from "whatamesh";

/**
 * Full-bleed animated WebGL mesh gradient — the real Stripe hero shader.
 * Reads its four colors from the `--gradient-color-1..4` CSS custom properties
 * set on `#gradient-canvas` (see .stripe-landing #gradient-canvas in index.css).
 */
export default function StripeGradient() {
  useEffect(() => {
    // whatamesh queries the DOM + uses WebGL/rAF, so it must run client-side only.
    const gradient = new Gradient() as { initGradient: (s: string) => void; pause?: () => void };
    gradient.initGradient("#gradient-canvas");
    return () => {
      // Stop the animation loop when the hero unmounts.
      gradient.pause?.();
    };
  }, []);

  return <canvas id="gradient-canvas" className="absolute inset-0 h-full w-full" />;
}
