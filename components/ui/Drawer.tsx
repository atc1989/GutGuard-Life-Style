"use client";

import { Dialog } from "@/components/ui/Dialog";
import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/** Commerce overlay: bottom sheet on mobile, centered dialog on desktop. */
export function Drawer({ id, title, open, onClose, children, footer }: Props) {
  return (
    <Dialog
      id={id}
      title={title}
      open={open}
      onClose={onClose}
      footer={footer}
    >
      {children}
    </Dialog>
  );
}
