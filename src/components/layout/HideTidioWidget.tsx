"use client";

import { useEffect } from "react";

/** Keeps a storefront-loaded Tidio widget hidden on routes that must not show it. */
export function HideTidioWidget() {
  useEffect(() => {
    function hide() {
      window.tidioChatApi?.hide();
    }

    hide();
    document.addEventListener("tidioChat-ready", hide);
    return () => {
      document.removeEventListener("tidioChat-ready", hide);
    };
  }, []);

  return null;
}
