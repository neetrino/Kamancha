"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { Locale } from "@/lib/i18n/config";

export type TidioVisitor = {
  distinct_id: string;
  email: string;
  name: string;
};

type TidioChatApi = {
  setVisitorData: (visitor: TidioVisitor) => void;
  show: () => void;
  hide: () => void;
  open: () => void;
  close: () => void;
};

declare global {
  interface Document {
    tidioChatLang?: string;
    tidioIdentify?: TidioVisitor;
  }

  interface Window {
    tidioChatApi?: TidioChatApi;
  }
}

const DESKTOP_CHAT_QUERY = "(min-width: 1280px)";

function setDesktopChatFrame(open: boolean): void {
  function apply(): void {
    const frame = document.getElementById("tidio-chat-iframe");
    if (!frame) {
      return;
    }

    const desktop = window.matchMedia(DESKTOP_CHAT_QUERY).matches;
    frame.classList.toggle("tidio-chat-open", open);
    frame.classList.toggle("tidio-desktop-panel", open && desktop);
  }

  apply();
  requestAnimationFrame(apply);
}

type TidioChatLoaderProps = {
  publicKey: string;
  locale: Locale;
  visitor: TidioVisitor | null;
  prompt: string;
  openLabel: string;
};

/**
 * Hides Tidio's default bubble and shows a site launcher: a rounded prompt
 * and a white circle with the forest-green icon. Opening still uses Tidio.
 */
export function TidioChatLoader({
  publicKey,
  locale,
  visitor,
  prompt,
  openLabel,
}: TidioChatLoaderProps) {
  const pathname = usePathname() ?? "";
  const onProfile =
    pathname === `/${locale}/profile` ||
    pathname.startsWith(`/${locale}/profile/`);
  const [isMobile, setIsMobile] = useState(false);
  const hideOnMobileProfile = onProfile && isMobile;
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1279px)");
    function sync(): void {
      setIsMobile(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!hideOnMobileProfile) {
      return;
    }
    window.tidioChatApi?.close();
    window.tidioChatApi?.hide();
  }, [hideOnMobileProfile]);

  useEffect(() => {
    document.tidioChatLang = locale;
  }, [locale]);

  useEffect(() => {
    function hideDefaultBubble() {
      window.tidioChatApi?.hide();
      setReady(true);
    }

    function markOpen() {
      setOpen(true);
      setDesktopChatFrame(true);
    }

    function markClosed() {
      setDesktopChatFrame(false);
      window.tidioChatApi?.hide();
      setOpen(false);
    }

    let panelOpen = false;

    function concealClosedBubble(frame: HTMLElement): void {
      const closedBubble = frame.offsetWidth < 200 && frame.offsetHeight < 200;
      if (!closedBubble) {
        panelOpen = true;
        frame.classList.remove("tidio-bubble");
        frame.style.removeProperty("visibility");
        frame.style.removeProperty("pointer-events");
        return;
      }

      frame.classList.add("tidio-bubble");
      const mobile = window.matchMedia("(max-width: 1279px)").matches;
      if (!mobile) {
        frame.style.setProperty("visibility", "hidden", "important");
        frame.style.setProperty("pointer-events", "none", "important");
      }
      if (!panelOpen) {
        return;
      }

      panelOpen = false;
      frame.classList.remove("tidio-chat-open", "tidio-desktop-panel");
      setOpen(false);
    }

    const frameObserver = new ResizeObserver((entries) => {
      const frame = entries[0]?.target;
      if (frame instanceof HTMLElement) {
        concealClosedBubble(frame);
      }
    });

    function watchFrame(): void {
      const frame = document.getElementById("tidio-chat-iframe");
      if (!frame) {
        return;
      }
      frameObserver.observe(frame);
      concealClosedBubble(frame);
    }

    const frameMountObserver = new MutationObserver(watchFrame);

    document.addEventListener("tidioChat-ready", hideDefaultBubble);
    document.addEventListener("tidioChat-open", markOpen);
    document.addEventListener("tidioChat-close", markClosed);
    frameMountObserver.observe(document.body, { childList: true, subtree: true });
    watchFrame();

    if (window.tidioChatApi) {
      hideDefaultBubble();
    }

    return () => {
      document.removeEventListener("tidioChat-ready", hideDefaultBubble);
      document.removeEventListener("tidioChat-open", markOpen);
      document.removeEventListener("tidioChat-close", markClosed);
      frameObserver.disconnect();
      frameMountObserver.disconnect();
      window.tidioChatApi?.hide();
    };
  }, []);

  useEffect(() => {
    if (!visitor) {
      delete document.tidioIdentify;
      return;
    }

    document.tidioIdentify = visitor;
    window.tidioChatApi?.setVisitorData(visitor);
  }, [visitor]);

  function openChat() {
    const api = window.tidioChatApi;
    if (!api) {
      return;
    }

    api.show();
    api.open();
  }

  return (
    <>
      <Script
        id="tidio-chat"
        src={`https://code.tidio.co/${publicKey}.js`}
        strategy="lazyOnload"
      />
      {ready && !open && !hideOnMobileProfile ? (
        <div className="animate-tidio-launcher-in fixed right-4 z-50 flex items-center gap-2 bottom-[var(--mobile-bottom-nav-clearance)] xl:bottom-6">
          <button
            type="button"
            onClick={openChat}
            className="hidden rounded-full bg-white px-5 py-3 text-sm font-bold text-brand-forest shadow-lg xl:inline"
          >
            {prompt}
          </button>
          <button
            type="button"
            aria-label={openLabel}
            onClick={openChat}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-brand-forest text-white shadow-lg xl:border xl:border-border xl:bg-white xl:text-brand-forest"
          >
            <ChatIcon />
          </button>
        </div>
      ) : null}
    </>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9 xl:h-11 xl:w-11" fill="currentColor">
      <path d="M7 4.5h10A2.5 2.5 0 0 1 19.5 7v7.2a2.5 2.5 0 0 1-2.5 2.5H9.2L4.5 20.8V7A2.5 2.5 0 0 1 7 4.5Z" />
      <circle cx="8.5" cy="11" r="1.15" className="fill-brand-forest xl:fill-white" />
      <circle cx="12" cy="11" r="1.15" className="fill-brand-forest xl:fill-white" />
      <circle cx="15.5" cy="11" r="1.15" className="fill-brand-forest xl:fill-white" />
    </svg>
  );
}
