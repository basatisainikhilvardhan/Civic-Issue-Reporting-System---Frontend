import React from "react";

export function PriorityBadge({ priority }) {
  const getPriorityConfig = (p) => {
    switch (p) {
      case "LOW":
        return {
          icon: "🟢",
          bg: "#f8fafc",
          color: "#475569",
          border: "#cbd5e1",
        };
      case "MEDIUM":
        return {
          icon: "🔵",
          bg: "#f0f9ff",
          color: "#0369a1",
          border: "#bae6fd",
        };
      case "HIGH":
        return {
          icon: "🟠",
          bg: "#fff7ed",
          color: "#c2410c",
          border: "#fed7aa",
        };
      case "CRITICAL":
        return {
          icon: "🔴",
          bg: "#fff1f2",
          color: "#be123c",
          border: "#fecdd3",
        };
      default:
        return {
          icon: "⚪",
          bg: "#f3f4f6",
          color: "#4b5563",
          border: "#e5e7eb",
        };
    }
  };

  const config = getPriorityConfig(priority);

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "0.72rem",
    fontWeight: "700",
    textTransform: "uppercase",
    backgroundColor: config.bg,
    color: config.color,
    border: `1px solid ${config.border}`,
    whiteSpace: "nowrap",
  };

  return (
    <span style={style}>
      <span style={{ fontSize: "0.65rem" }}>{config.icon}</span>
      <span>{priority || "MEDIUM"}</span>
    </span>
  );
}

export default PriorityBadge;
