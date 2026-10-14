"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { unlockComingSoonAction } from "@/components/layout/unlock-coming-soon-action";

const CODE_LENGTH = 8;

export function ComingSoonUnlock() {
  const router = useRouter();
  const pendingRef = useRef(false);
  const [value, setValue] = useState("");

  function onChange(next: string) {
    setValue(next);
    if (next.length < CODE_LENGTH || pendingRef.current) {
      return;
    }

    pendingRef.current = true;
    void unlockComingSoonAction(next.slice(-CODE_LENGTH)).then((unlocked) => {
      pendingRef.current = false;
      if (unlocked) {
        router.refresh();
        return;
      }
      setValue("");
    });
  }

  return (
    <form
      className="fixed bottom-[12%] left-1/2 z-20 w-[min(18rem,calc(100%-2.5rem))] -translate-x-1/2"
      onSubmit={(event) => {
        event.preventDefault();
        onChange(value);
      }}
    >
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        aria-label="Password"
        placeholder="password"
        value={value}
        spellCheck={false}
        className="w-full border border-white/80 bg-black/25 px-4 py-3 text-center text-base text-white outline-none placeholder:text-white/70"
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </form>
  );
}
