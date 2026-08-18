"use client";

import { Dialog } from "@/components/ui/Dialog";
import type { ReactNode } from "react";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/** Commerce overlay: bottom sheet on mobile, centered dialog on desktop. */
export function Drawer({ title, open, onClose, children, footer }: Props) {
  return (
    <Dialog
      title={title}
      open={open}
      onClose={onClose}
      footer={footer}
    >
      {children}
    </Dialog>
  );
}
