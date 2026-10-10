import { createFileRoute } from "@tanstack/react-router";
import { EarnScreen } from "@/screens/EarnScreen";

export const Route = createFileRoute("/earn")({ component: EarnScreen });
