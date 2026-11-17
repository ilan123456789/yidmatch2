"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function JobRedirectPage() {
  const params = useParams();

  useEffect(() => {
    const rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "";
    const cleanId = rawId.replace(/^job-job-/, "job-");
    window.location.replace(`/#${cleanId.startsWith("job-") ? cleanId : "job-" + cleanId}`);
  }, [params?.id]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fbfa", fontFamily: "sans-serif" }}>
      <p style={{ color: "#081c3b", fontWeight: 700 }}>Opening job details...</p>
    </div>
  );
}
