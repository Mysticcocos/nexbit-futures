import { createFileRoute } from "@tanstack/react-router";
import { FuturesScreen } from "@/screens/FuturesScreen";

export const Route = createFileRoute("/futures")({ component: FuturesScreen });
