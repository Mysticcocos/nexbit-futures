import { createFileRoute } from "@tanstack/react-router";
import { AdminScreen } from "@/screens/AdminScreen";

export const Route = createFileRoute("/admin")({ component: AdminScreen });
