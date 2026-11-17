"use client";

import { createContext, useContext, useEffect, useRef } from "react";

/**
 * A slide-scoped keyboard handler. Return `true` when the event was consumed,
 * so the presentation does not also treat it as navigation.
 */
export type SlideKeyHandler = (event: KeyboardEvent) => boolean;

type DeckContextValue = {
  registerKeyHandler: (slideId: string, handler: SlideKeyHandler | null) => void;
  reducedMotion: boolean;
};

export const DeckContext = createContext<DeckContextValue | null>(null);

export function useDeck() {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be used inside <Presentation>");
  return ctx;
}

/** Registers a key handler for the given slide while `enabled` is true. */
export function useSlideKeys(slideId: string, enabled: boolean, handler: SlideKeyHandler) {
  const { registerKeyHandler } = useDeck();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    registerKeyHandler(slideId, (e) => handlerRef.current(e));
    return () => registerKeyHandler(slideId, null);
  }, [slideId, enabled, registerKeyHandler]);
}
