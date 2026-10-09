"use client";

import { Dialog } from "@/components/ui/Dialog";
import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  subtitle?: ReactNode;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * UI Library `Sheet`, `lifestyle` variant: bottom sheet on phones (rounded top,
 * at most 90vh), centred from 900px. Shares the Dialog focus trap and inert
 * page handling.
 */
export function Sheet(props: Props) {
  return <Dialog {...props} variant="sheet" />;
}
