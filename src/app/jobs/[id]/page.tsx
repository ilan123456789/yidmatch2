"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function JobRedirectPage() {
  const params = useParams();

  useEffect(() => {
    const rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "";
    const cleanId = rawId.replace(/^job-job-/, "job-");
    const fullId = cleanId.startsWith("job-") ? cleanId : `job-${cleanId}`;
    window.location.replace(`/#${fullId}`);
  }, [params?.id]);

  return null;
}
