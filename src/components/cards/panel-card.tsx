import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PanelCardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function PanelCard({ title, description, className, children }: PanelCardProps) {
  return (
    <Card className={cn("rounded-2xl border-border/70 shadow-sm", className)}>
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
