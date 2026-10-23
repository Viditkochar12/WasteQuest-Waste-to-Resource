import { useRef, useState, useEffect } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useInView } from "../../hooks/useInView";

const ITEMS_DATA = [
  { id: "item-1", name: "Plastic bottle", label: "Plastic bottle → plastic bin", icon: "🧴", color: "#38bdf8", speed: 1.1, x: 22 },
  { id: "item-2", name: "Aluminum can", label: "Aluminum can → metal bin", icon: "🥫", color: "#a78bfa", speed: 1.3, x: 42 },
  { id: "item-3", name: "Cardboard box", label: "Cardboard → paper bin", icon: "📦", color: "#fbbf24", speed: 0.9, x: 62 },
  { id: "item-4", name: "Glass jar", label: "Glass jar → glass bin", icon: "🍾", color: "#34d399", speed: 1.2, x: 78 },
  { id: "item-5", name: "Fruit peel", label: "Organic waste → compost bin", icon: "🍏", color: "#4ade80", speed: 1.0, x: 33 },
  { id: "item-6", name: "Dead battery", label: "Battery → e-waste kiosk", icon: "🔋", color: "#f87171", speed: 1.4, x: 53 },
  { id: "item-7", name: "Newspaper", label: "Newspaper → paper bin", icon: "📄", color: "#fbbf24", speed: 0.85, x: 70 }
];

export function SmartBinHero() {
  const prefersReducedMotion = useReducedMotion();
  const [containerRef, isInView] = useInView({ threshold: 0.1 });
  const heroRef = useRef(null);
  const binRef = useRef(null);

  // Eye & pointer coordinates
  const pointerPos = useRef({ x: 0, y: 0 });
  const currentEyeAngle = useRef(0);
  const targetEyeAngle = useRef(0);

  // Active sorted item label
  const [activeLabel, setActiveLabel] = useState(null);
  const [pulseScan, setPulseScan] = useState(false);

  // Falling items physics state in refs (avoiding React re-renders per frame)
  const itemsState = useRef(
    ITEMS_DATA.map((item, idx) => ({
      ...item,
      y: -50 - idx * 75,
      isAbsorbed: false,
      opacity: 1,
      scale: 1
    }))
  );

  const itemsElementsRef = useRef([]);

  // Mouse / Pointer movement listener
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handlePointerMove = (e) => {
      if (!binRef.current) return;
      const binRect = binRef.current.getBoundingClientRect();
      const binCenterX = binRect.left + binRect.width / 2;
      const binCenterY = binRect.top + binRect.height * 0.35;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      pointerPos.current = { x: clientX, y: clientY };

      const dx = clientX - binCenterX;
      const dy = clientY - binCenterY;
      targetEyeAngle.current = Math.atan2(dy, dx) * (180 / Math.PI);
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
    };
  }, [prefersReducedMotion]);

  // Main animation loop
  useEffect(() => {
    if (prefersReducedMotion || !isInView) return;

    let frameId;
    let labelTimeout = null;
    let pulseTimeout = null;

    const animate = () => {
      if (document.hidden) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      // 1. Lerp eye rotation: pos += (target - pos) * 0.12
      let angleDiff = targetEyeAngle.current - currentEyeAngle.current;
      // Normalize angle difference to [-180, 180]
      while (angleDiff < -180) angleDiff += 360;
      while (angleDiff > 180) angleDiff -= 360;
      currentEyeAngle.current += angleDiff * 0.12;

      const eyePupil = document.getElementById("smartbin-eye-pupil");
      if (eyePupil) {
        const rad = (currentEyeAngle.current * Math.PI) / 180;
        const pupilRadius = 14;
        const px = Math.cos(rad) * pupilRadius;
        const py = Math.sin(rad) * pupilRadius;
        eyePupil.style.transform = `translate(${px}px, ${py}px)`;
      }

      // 2. Animate falling waste items
      const binHeight = 360;
      const suctionThreshold = 250;

      itemsState.current.forEach((item, index) => {
        const el = itemsElementsRef.current[index];
        if (!el) return;

        if (!item.isAbsorbed) {
          item.y += item.speed * 1.5;

          // Check if item enters suction zone near bin mouth (x approx 30% to 70%, y > threshold)
          const isNearBinCenter = item.x >= 32 && item.x <= 68;
          if (isNearBinCenter && item.y >= suctionThreshold && item.y < suctionThreshold + 30) {
            item.isAbsorbed = true;

            // Trigger scan ring pulse and label
            setPulseScan(true);
            setActiveLabel(item.label);

            if (pulseTimeout) clearTimeout(pulseTimeout);
            pulseTimeout = setTimeout(() => setPulseScan(false), 500);

            if (labelTimeout) clearTimeout(labelTimeout);
            labelTimeout = setTimeout(() => setActiveLabel(null), 1800);
          }
        } else {
          // Sucked into bin: shrink scale and fade
          item.scale = Math.max(0, item.scale - 0.08);
          item.opacity = Math.max(0, item.opacity - 0.1);
          item.y += 1.2;

          if (item.scale <= 0.05 || item.opacity <= 0.05) {
            // Respawn above screen
            item.y = -60 - Math.random() * 80;
            item.x = 15 + Math.random() * 70;
            item.scale = 1;
            item.opacity = 1;
            item.isAbsorbed = false;
          }
        }

        // Loop recycle if it falls past bottom without entering bin
        if (item.y > binHeight + 40) {
          item.y = -60;
          item.x = 15 + Math.random() * 70;
        }

        el.style.transform = `translate3d(0, ${item.y}px, 0) scale(${item.scale})`;
        el.style.opacity = item.opacity;
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      if (labelTimeout) clearTimeout(labelTimeout);
      if (pulseTimeout) clearTimeout(pulseTimeout);
    };
  }, [isInView, prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="section-wrapper"
      style={{
        paddingTop: "clamp(3rem, 6vw, 5rem)",
        paddingBottom: "clamp(4rem, 8vw, 6rem)",
        position: "relative",
        overflow: "hidden"
      }}
      aria-labelledby="hero-title"
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "clamp(2rem, 5vw, 4rem)",
            alignItems: "center"
          }}
        >
          {/* Hero Pitch & Copy */}
          <div>
            <div className="section-tag">
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--brand-primary)",
                  boxShadow: "0 0 10px var(--brand-primary)"
                }}
              />
              Track 06 • Sustainability & Climate Tech
            </div>

            <h1 id="hero-title" style={{ marginBottom: "1.25rem" }}>
              Turn Waste Into High-Value Resources
            </h1>

            <p
              style={{
                fontSize: "clamp(1.0625rem, 1.5vw, 1.25rem)",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                marginBottom: "2rem"
              }}
            >
              Scan discarded items instantly. Our AI vision classifier identifies recyclable materials, guides proper
              bin segregation, and tracks verifiable carbon and water savings for a circular economy.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
              <a href="#scan-workspace" className="btn btn-primary" style={{ paddingInline: "1.75rem" }}>
                Scan waste
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>

              <a href="#road-journey" className="btn btn-secondary">
                Explore journey
              </a>
            </div>

            {/* Educational Guarantee */}
            <div
              style={{
                marginTop: "2.5rem",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "1.5rem"
              }}
            >
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 700, color: "var(--brand-primary)" }}>
                  7
                </span>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Material Streams</p>
              </div>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 700, color: "var(--cat-plastic)" }}>
                  5 MB
                </span>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Raw Image Intake</p>
              </div>
              <div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.5rem", fontWeight: 700, color: "var(--cat-organic)" }}>
                  100%
                </span>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Verifiable Data</p>
              </div>
            </div>
          </div>

          {/* Smart Bin Simulation Visual Stage */}
          <div
            ref={heroRef}
            style={{
              position: "relative",
              height: "440px",
              background: "radial-gradient(ellipse at 50% 65%, rgba(16, 185, 129, 0.12) 0%, rgba(11, 19, 14, 0) 70%)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              overflow: "hidden",
              paddingBottom: "1.5rem"
            }}
            aria-label="Interactive Smart Bin Demonstration"
          >
            {/* Drifting waste items (positioned absolutely) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                overflow: "hidden"
              }}
              aria-hidden="true"
            >
              {ITEMS_DATA.map((item, idx) => (
                <div
                  key={item.id}
                  ref={(el) => (itemsElementsRef.current[idx] = el)}
                  style={{
                    position: "absolute",
                    left: `${item.x}%`,
                    top: 0,
                    fontSize: "1.875rem",
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
                    willChange: "transform, opacity",
                    transition: prefersReducedMotion ? "none" : undefined
                  }}
                  title={item.name}
                >
                  {item.icon}
                </div>
              ))}
            </div>

            {/* Suction & Scan Pulse Ring */}
            {pulseScan && !prefersReducedMotion && (
              <div
                style={{
                  position: "absolute",
                  bottom: "190px",
                  width: "160px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "2px solid var(--brand-primary)",
                  boxShadow: "0 0 24px var(--brand-primary)",
                  animation: "pulseExpand 0.5s ease-out forwards",
                  pointerEvents: "none",
                  zIndex: 20
                }}
              />
            )}

            {/* Sorting Tag Label */}
            {activeLabel && (
              <div
                role="status"
                style={{
                  position: "absolute",
                  bottom: "220px",
                  background: "rgba(18, 31, 24, 0.95)",
                  border: "1px solid var(--brand-primary)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  padding: "0.375rem 0.75rem",
                  borderRadius: "var(--radius-full)",
                  boxShadow: "var(--shadow-elevated)",
                  zIndex: 30,
                  whiteSpace: "nowrap",
                  animation: "fadeInUp 0.25s ease-out forwards"
                }}
              >
                ✨ {activeLabel}
              </div>
            )}

            {/* Inline SVG Smart Bin with Camera Eye Turret */}
            <div
              ref={binRef}
              style={{
                position: "relative",
                width: "220px",
                height: "230px",
                zIndex: 10
              }}
            >
              <svg
                width="220"
                height="230"
                viewBox="0 0 220 230"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Autonomous AI Smart Bin with camera scanner eye"
              >
                {/* Bin Base & Body */}
                <path
                  d="M45 75L58 205C59 214 67 220 76 220H144C153 220 161 214 162 205L175 75H45Z"
                  fill="#15261d"
                  stroke="#2c4b3a"
                  strokeWidth="3"
                />
                
                {/* Front accent plate */}
                <path
                  d="M66 95L75 195C76 201 81 205 87 205H133C139 205 144 201 145 195L154 95H66Z"
                  fill="#0e1b14"
                  stroke="#10b981"
                  strokeOpacity="0.4"
                  strokeWidth="1.5"
                />

                {/* Recycle Emblem on body */}
                <g transform="translate(110, 150) scale(0.9)" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M-10 12 L-18 0 L-10 -12" />
                  <path d="M-18 0 H6" />
                  <path d="M12 -14 L18 0 L10 14" />
                  <path d="M18 0 L-2 -14" />
                  <path d="M10 14 L0 18 L-10 14" />
                  <path d="M0 18 L6 -6" />
                </g>

                {/* Suction Mouth / Intake Aperture */}
                <ellipse cx="110" cy="74" rx="66" ry="16" fill="#080e0a" stroke="#10b981" strokeWidth="2.5" />
                <ellipse cx="110" cy="74" rx="52" ry="10" fill="#040805" />

                {/* Laser scan line inside mouth */}
                <line x1="65" y1="74" x2="155" y2="74" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.8" />

                {/* Upper Turret / Sensor Head */}
                <path
                  d="M80 60C80 43.4 93.4 30 110 30C126.6 30 140 43.4 140 60H80Z"
                  fill="#1c3327"
                  stroke="#34d399"
                  strokeWidth="2.5"
                />

                {/* Camera Eye Housing (Outer Ring) */}
                <circle cx="110" cy="46" r="20" fill="#0c1812" stroke="#10b981" strokeWidth="2" />
                <circle cx="110" cy="46" r="16" fill="#060e0a" />

                {/* Follower Eye Pupil (Lerped pointer target) */}
                <g id="smartbin-eye-pupil" style={{ transformOrigin: "110px 46px" }}>
                  <circle cx="110" cy="46" r="7" fill="#10b981" />
                  <circle cx="108" cy="44" r="2.5" fill="#ffffff" />
                </g>

                {/* Status LED */}
                <circle cx="132" cy="38" r="3" fill="#10b981" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mandatory Caption as explicitly required */}
        <div
          className="section-caption"
          style={{ maxWidth: "620px", margin: "1.5rem auto 0" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            <strong>Demo animation.</strong> Real classification happens in the Scan workspace below.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulseExpand {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
