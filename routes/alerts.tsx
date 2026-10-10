import { createFileRoute } from "@tanstack/react-router";
import { AlertsScreen } from "@/screens/AlertsScreen";

export const Route = createFileRoute("/alerts")({ component: AlertsScreen });
