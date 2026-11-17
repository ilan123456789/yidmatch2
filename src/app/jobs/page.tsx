"use client";

import { useEffect } from "react";

export default function JobsDirectoryPage() {
  useEffect(() => {
    window.location.replace("/#jobs");
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fbfa", fontFamily: "sans-serif" }}>
      <p style={{ color: "#081c3b", fontWeight: 700 }}>Loading YidMatch jobs...</p>
    </div>
  );
}
