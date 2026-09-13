import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <Card variant="auth" className="gg-stack">
      {children}
    </Card>
  );
}
