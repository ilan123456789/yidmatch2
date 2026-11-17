"use client";

import { useEffect } from "react";

export default function JobsPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash) {
        window.location.replace(`/${hash}`);
      } else if (search) {
        window.location.replace(`/${search}`);
      } else {
        window.location.replace("/#jobs");
      }
    }
  }, []);

  return null;
}
