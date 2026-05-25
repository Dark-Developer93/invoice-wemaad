"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import SubmitButton from "@/components/submit-button/SubmitButton";

interface InvoiceActionsSectionProps {
  mode: "create" | "edit";
  sendEmail: boolean;
  setSendEmail: (v: boolean) => void;
  isLoading: boolean;
  onClose?: () => void;
  onCancelClick: () => void;
}

export function InvoiceActionsSection({
  mode,
  sendEmail,
  setSendEmail,
  isLoading,
  onClose,
  onCancelClick,
}: InvoiceActionsSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Switch
          id="send-email"
          checked={sendEmail}
          onCheckedChange={setSendEmail}
        />
        <div className="flex items-center gap-1.5">
          <Mail className="size-4 text-muted-foreground" />
          <label
            htmlFor="send-email"
            className="text-sm cursor-pointer select-none"
          >
            {sendEmail ? "Send email to client" : "Don't send email"}
          </label>
        </div>
      </div>

      <div className="flex gap-3 w-full sm:w-auto">
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelClick}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
        )}
        <SubmitButton
          text={
            mode === "create"
              ? sendEmail
                ? "Send Invoice to Client"
                : "Create Invoice"
              : sendEmail
              ? "Update & Notify Client"
              : "Update Invoice"
          }
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
