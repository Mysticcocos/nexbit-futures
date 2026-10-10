import { createFileRoute } from "@tanstack/react-router";
import { useIsDesk } from "@/lib/desk";
import { CopyScreen } from "@/screens/CopyScreen";
import { WebCopy } from "@/screens/desk/WebCopy";

export const Route = createFileRoute("/copy")({ component: CopyRoute });

function CopyRoute() {
  const wide = useIsDesk();
  if (wide) return <WebCopy />;
  return <CopyScreen />;
}
