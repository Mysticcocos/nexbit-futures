import { useEffect, useState } from "react";

function forcedDesk() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("desk") === "1" || q.get("ext") === "1";
}

export function useIsDesk() {
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const apply = () => setDesk(forcedDesk() || window.innerWidth >= 960);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return desk;
}
