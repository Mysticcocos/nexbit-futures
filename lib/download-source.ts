export async function downloadNexbitZip(): Promise<boolean> {
  const urls = ["/nexbit.zip", "/api/source"];
  for (const href of urls) {
    try {
      const res = await fetch(href, { cache: "no-store" });
      if (!res.ok) continue;
      const blob = await res.blob();
      if (blob.size < 1024) continue;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nexbit.zip";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      return true;
    } catch {
      /* try next */
    }
  }
  try {
    const opened = window.open("/api/source", "_blank", "noopener");
    if (opened) return true;
  } catch {
    /* iframe may block popups */
  }
  const fallback = document.createElement("a");
  fallback.href = "/nexbit.zip";
  fallback.download = "nexbit.zip";
  fallback.target = "_blank";
  fallback.rel = "noopener";
  document.body.appendChild(fallback);
  fallback.click();
  fallback.remove();
  return false;
}
