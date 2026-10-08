import React from "react";

export function StatusBadge({ status }) {
  const getBadgeConfig = (st) => {
    switch (st) {
      case "NEW":
        return {
          icon: "●",
          bg: "#fef3c7",
          color: "#92400e",
          border: "#fcd34d",
        };
      case "ASSIGNED":
        return {
          icon: "📋",
          bg: "#e0f2fe",
          color: "#0369a1",
          border: "#7dd3fc",
        };
      case "IN_PROGRESS":
        return {
          icon: "⚡",
          bg: "#e0e7ff",
          color: "#4338ca",
          border: "#a5b4fc",
        };
      case "RESOLVED":
        return {
          icon: "✓",
          bg: "#dcfce7",
          color: "#15803d",
          border: "#86efac",
        };
      case "REJECTED":
        return {
          icon: "✕",
          bg: "#fee2e2",
          color: "#b91c1c",
          border: "#fca5a5",
        };
      default:
        return {
          icon: "•",
          bg: "#f3f4f6",
          color: "#374151",
          border: "#d1d5db",
        };
    }
  };

  const config = getBadgeConfig(status);

  const style = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "3px 10px",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "700",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    backgroundColor: config.bg,
    color: config.color,
    border: `1px solid ${config.border}`,
    whiteSpace: "nowrap",
  };

  return (
    <span style={style}>
      <span style={{ fontSize: "0.75rem", lineHeight: 1 }}>{config.icon}</span>
      <span>{status || "UNKNOWN"}</span>
    </span>
  );
}

export default StatusBadge;
