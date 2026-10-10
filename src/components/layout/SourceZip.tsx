import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadNexbitZip } from "@/lib/download-source";
import { cn } from "@/lib/utils";

export function SourceZipButton({
  size = "md",
  label = "Скачать ZIP",
}: {
  size?: "md" | "lg";
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className={cn("flex w-full flex-col items-center", size === "lg" ? "max-w-xs" : "")}>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void downloadNexbitZip()
            .then((ok) => {
              if (ok) toast.success("nexbit.zip downloading");
              else toast.message("If it did not start, use the direct link below");
            })
            .finally(() => setBusy(false));
        }}
        className={cn(
          "relative flex w-full items-center justify-center gap-2 rounded-nx font-semibold text-nx-accent-fg nx-elev transition-transform duration-150 ease-out active:scale-[0.98] disabled:opacity-60",
          size === "lg" ? "h-12 text-sm" : "h-12 text-sm",
        )}
        style={{ background: "var(--nx-accent)" }}
      >
        <Download className="size-4" strokeWidth={2} />
        {busy ? "Preparing…" : label}
      </button>
      <a
        href="/nexbit.zip"
        download="nexbit.zip"
        className="mt-3 text-xs text-nx-accent underline underline-offset-4"
      >
        Прямая ссылка: nexbit.zip
      </a>
    </div>
  );
}
