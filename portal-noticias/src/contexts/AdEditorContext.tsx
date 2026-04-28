"use client";

import { createContext } from "react";
import type { AdSlot } from "@/hooks/useAdCanvas";

export interface AdEditorContextType {
  isEditing: boolean;
  slots: AdSlot[];
  assignments: Record<string, string>;
  onRemoveFromZone?: (zoneId: string) => void;
  onSelectSlot?: (slotId: string) => void;
  selectedSlotId?: string | null;
  previewNoticiaId?: string | null;
  onAddSlot?: (zoneId: string) => void;
}

export const AdEditorContext = createContext<AdEditorContextType>({
  isEditing: false,
  slots: [],
  assignments: {},
});
