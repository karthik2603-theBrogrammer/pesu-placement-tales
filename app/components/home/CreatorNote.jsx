"use client";

import { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

// Edit NOTE_PARAGRAPHS to write your note. Each string is one paragraph.
// Bump NOTE_VERSION whenever the note changes so returning visitors see it again.
const NOTE_VERSION = "1";
const NOTE_PARAGRAPHS = [
  "A personal note from the creator is coming soon. Check back shortly!",
];
const SIGNATURE = "Karthik Namboori";
const SIGNATURE_ROLE = "Creator, PESU Placement Tales";

const STORAGE_KEY = "pt_creator_note_seen";
const OPEN_DELAY_MS = 600;

export default function CreatorNote() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    let seen = null;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable (e.g. privacy mode); show the note anyway.
    }
    if (seen === NOTE_VERSION) return;
    const timer = setTimeout(onOpen, OPEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [onOpen]);

  const handleOpenChange = (open) => {
    if (!open) {
      try {
        window.localStorage.setItem(STORAGE_KEY, NOTE_VERSION);
      } catch {
        // Ignore storage failures.
      }
    }
    onOpenChange(open);
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-amber-700 shadow-sm backdrop-blur transition hover:bg-amber-100"
      >
        <span aria-hidden="true">✉️</span>
        A note from the creator
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        placement="center"
        size="lg"
        backdrop="blur"
        scrollBehavior="outside"
        classNames={{
          base: "rounded-2xl border border-amber-200/70 bg-gradient-to-br from-yellow-50 via-amber-50 to-white",
          backdrop: "bg-amber-950/20",
          closeButton: "text-amber-700 hover:bg-amber-100",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-3 pb-2 pt-6">
                <span className="w-fit rounded-full border border-amber-200/70 bg-amber-100/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  From the creator
                </span>
                <span className="text-xl font-black tracking-tight text-amber-950 sm:text-2xl">
                  A note from the creator
                </span>
              </ModalHeader>
              <ModalBody className="space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                {NOTE_PARAGRAPHS.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="pt-2 text-sm font-semibold text-amber-800">
                  — {SIGNATURE}
                  <span className="block text-xs font-medium text-slate-500">{SIGNATURE_ROLE}</span>
                </p>
              </ModalBody>
              <ModalFooter className="pb-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
                >
                  Let&apos;s go
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
