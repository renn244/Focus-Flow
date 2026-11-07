import type { ComponentType, RefAttributes } from "react";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";

/** What a suggestion list exposes so the editor can pass arrow keys and Enter to it. */
export type SuggestionListHandle = { onKeyDown: (props: SuggestionKeyDownProps) => boolean };

type ListComponent<I, C> = ComponentType<SuggestionProps<I, C> & RefAttributes<SuggestionListHandle>>;

/**
 * Renders a suggestion list (the `#` task picker, the `/` menu) in a fixed
 * popup under the cursor, or above it when there is no room below.
 */
export const suggestionPopup =
  <I, C = I>(Component: ListComponent<I, C>, { width = 300, height = 260 } = {}): SuggestionOptions<I, C>["render"] =>
  () => {
    let renderer: ReactRenderer<SuggestionListHandle, SuggestionProps<I, C>> | null = null;
    let host: HTMLDivElement | null = null;

    const place = (props: SuggestionProps<I, C>) => {
      const rect = props.clientRect?.();
      if (!host || !rect) return;
      const below = rect.bottom + 6;
      const fitsBelow = below + height < window.innerHeight;
      host.style.display = "";
      host.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
      host.style.top = fitsBelow ? `${below}px` : "";
      host.style.bottom = fitsBelow ? "" : `${window.innerHeight - rect.top + 6}px`;
    };

    return {
      onStart: (props) => {
        renderer = new ReactRenderer(Component, { props, editor: props.editor });
        host = document.createElement("div");
        host.style.position = "fixed";
        host.style.zIndex = "60";
        host.appendChild(renderer.element);
        document.body.appendChild(host);
        place(props);
      },
      onUpdate: (props) => {
        renderer?.updateProps(props);
        place(props);
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          if (host) host.style.display = "none";
          return true;
        }
        if (host?.style.display === "none") return false;
        return renderer?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        host?.remove();
        renderer?.destroy();
        host = null;
        renderer = null;
      },
    };
  };
