import { createFileRoute } from "@tanstack/react-router";
import { VhfApp } from "@/components/vhf/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <VhfApp />;
}
