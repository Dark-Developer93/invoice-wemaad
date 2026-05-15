import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  title: string;
  description?: string;
  message: ReactNode;
}

export function UpgradePrompt({ title, description, message }: UpgradePromptProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground max-w-sm">{message}</p>
        <Button asChild>
          <a href="/dashboard/billing">Upgrade Plan</a>
        </Button>
      </CardContent>
    </Card>
  );
}
