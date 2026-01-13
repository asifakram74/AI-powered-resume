"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
}

export function ConfirmDialog({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  trigger,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  // If there's a trigger, render it with click handler, otherwise render nothing
  const triggerElement = trigger ? (
    <div onClick={() => setOpen(true)} style={{ display: 'inline-block' }}>
      {trigger}
    </div>
  ) : null;

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl dark:border-0 dark:p-[1px] dark:overflow-hidden dark:bg-transparent">
          <div className="hidden dark:block absolute inset-0 gradient-border-moving -z-10" />
          <div className="dark:bg-[#0B0F1A] dark:rounded-2xl p-6 h-full w-full">
            <DialogHeader className="relative pb-2">
              <div className="absolute -left-4 -top-4 w-24 h-24 resumaic-gradient-orange opacity-10 blur-2xl -z-10" />
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold dark:text-gray-100">
                <AlertCircle className="h-5 w-5 text-red-500" />
                {title}
              </DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">{description}</DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex gap-2 sm:justify-end mt-4">
              <Button variant="outline" onClick={handleCancel}>
                {cancelText}
              </Button>
              <Button variant="destructive" onClick={handleConfirm}>
                {confirmText}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
