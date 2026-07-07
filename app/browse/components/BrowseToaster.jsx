"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const MOBILE_QUERY = "(max-width: 767px)";

/** Toasts below the sticky navbar on desktop; bottom on mobile. */
export default function BrowseToaster() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    return (
      <Toaster
        position="bottom-center"
        offset={16}
        visibleToasts={3}
        className="browse-toaster"
      />
    );
  }

  return (
    <Toaster
      position="top-center"
      offset={80}
      visibleToasts={3}
      className="browse-toaster"
    />
  );
}
