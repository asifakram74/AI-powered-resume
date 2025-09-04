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
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <AlertCircle className="h-6 w-6 text-red-500" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-gray-500">{description}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
