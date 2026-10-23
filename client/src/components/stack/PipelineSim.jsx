import { useReducedMotion } from "../../hooks/useReducedMotion";

export function PipelineSim({ stages, inputToken, outputToken, litColor, isActive, caption }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      style={{
        background: "var(--panel-sim)",
        borderRadius: "var(--radius-md)",
        padding: "clamp(1rem, 2.5vw, 1.5rem)",
        border: "1px solid var(--border-subtle)",
        position: "relative",
        marginTop: "1.25rem"
      }}
      aria-label="Processing pipeline simulation"
    >
      {/* Dashed track with 4 Stage Nodes */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBlock: "1.5rem 1rem",
          marginInline: "1rem"
        }}
      >
        {/* Dashed Track Line */}
        <div
          style={{
            position: "absolute",
            top: "calc(1.5rem + 18px)",
            left: "18px",
            right: "18px",
            height: "2px",
            background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 6px, transparent 6px, transparent 12px)",
            zIndex: 1
          }}
        />

        {/* Travelling Input Token */}
        {!prefersReducedMotion && isActive && (
          <div
            className="travelling-token"
            style={{
              position: "absolute",
              top: "calc(1.5rem + 4px)",
              left: "10px",
              fontSize: "1.5rem",
              zIndex: 10,
              pointerEvents: "none",
              animation: "tokenTravel 4s infinite cubic-bezier(0.4, 0, 0.2, 1)"
            }}
            aria-hidden="true"
          >
            {inputToken}
          </div>
        )}

        {/* 4 Stage Nodes */}
        {stages.map((stage, idx) => {
          const delaySec = idx * 0.9;
          return (
            <div
              key={stage}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                position: "relative",
                zIndex: 5
              }}
            >
              {/* Circle Node */}
              <div
                className={`pipeline-node node-${idx}`}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--node-circle)",
                  border: `2px solid ${prefersReducedMotion ? litColor : "rgba(255, 255, 255, 0.2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: prefersReducedMotion ? litColor : "var(--mute)",
                  transition: "all 0.3s ease",
                  animation:
                    !prefersReducedMotion && isActive
                      ? `nodeLightUp 4s infinite ease-in-out ${delaySec}s`
                      : "none",
                  boxShadow: prefersReducedMotion ? `0 0 12px ${litColor}` : "none"
                }}
              >
                0{idx + 1}
              </div>

              {/* Stage Name */}
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  textAlign: "center",
                  whiteSpace: "nowrap"
                }}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Output Token Result at the end */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "0.5rem",
          paddingTop: "0.5rem",
          borderTop: "1px solid var(--panel-inner)"
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--mute)" }}>Recovered Product:</span>
        <span
          style={{
            fontSize: "1.25rem",
            animation: !prefersReducedMotion && isActive ? "popResult 4s infinite ease" : "none"
          }}
          aria-hidden="true"
        >
          {outputToken}
        </span>
      </div>

      {/* Caption in real DOM text as strictly specified */}
      <div className="caption-box" style={{ marginTop: "0.875rem", fontSize: "0.8125rem" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{caption}</span>
      </div>

      <style>{`
        @keyframes tokenTravel {
          0% {
            left: 2%;
            transform: scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1.1);
          }
          85% {
            left: 88%;
            opacity: 1;
            transform: scale(1);
          }
          95%, 100% {
            left: 92%;
            opacity: 0;
            transform: scale(0.4);
          }
        }

        @keyframes nodeLightUp {
          0%, 10% {
            border-color: rgba(255, 255, 255, 0.2);
            color: var(--mute);
            box-shadow: none;
          }
          15%, 35% {
            border-color: ${litColor};
            color: ${litColor};
            box-shadow: 0 0 14px ${litColor};
          }
          40%, 100% {
            border-color: rgba(255, 255, 255, 0.35);
            color: var(--ink);
            box-shadow: none;
          }
        }

        @keyframes popResult {
          0%, 80% {
            transform: scale(0.8);
            opacity: 0.4;
          }
          88%, 96% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
