import { createFileRoute } from "@tanstack/react-router";
import { ActivityScreen } from "@/screens/ActivityScreen";

export const Route = createFileRoute("/activity")({ component: ActivityScreen });
