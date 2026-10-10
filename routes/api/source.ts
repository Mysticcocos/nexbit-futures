import { createFileRoute } from "@tanstack/react-router";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function zipPath() {
  const candidates = [
    join(process.cwd(), "public", "nexbit.zip"),
    join(process.cwd(), "nexbit.zip"),
    "/workspace/public/nexbit.zip",
    "/workspace/nexbit.zip",
  ];
  return candidates.find((p) => existsSync(p));
}

export const Route = createFileRoute("/api/source")({
  server: {
    handlers: {
      GET: async () => {
        const p = zipPath();
        if (!p) return new Response("Source zip not found", { status: 404 });
        const buf = readFileSync(p);
        return new Response(buf, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": 'attachment; filename="nexbit.zip"',
            "Cache-Control": "no-store",
            "Content-Length": String(buf.byteLength),
          },
        });
      },
    },
  },
});
