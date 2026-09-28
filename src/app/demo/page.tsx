import type { Metadata } from "next";
import { DemoWorkspace } from "@/components/demo/demo-workspace";

export const metadata: Metadata = {
  title: "Live demo — Architect 2.0",
  description: "Watch Architect 2.0 plan, build, and preview an app or agent in real time — no sign-up required.",
};

export default function DemoPage() {
  return <DemoWorkspace />;
}
