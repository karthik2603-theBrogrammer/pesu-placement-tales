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
import { FaGithub } from "react-icons/fa";
import { REPO_URL } from "../../../utils/github";

// Edit NOTE_BODY to change the note.
// Bump NOTE_VERSION whenever the note changes so returning visitors see it again.
const NOTE_VERSION = "3";
const NOTE_BODY =
  "If there's a feature you'd love to see, you can build it yourself and contribute it on GitHub — every improvement helps the next batch.";

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
        From the creator
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
              <ModalHeader className="justify-center pb-0 pt-7">
                <span className="w-fit rounded-full border border-amber-200/70 bg-amber-100/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                  From the creator
                </span>
              </ModalHeader>
              <ModalBody className="pt-5">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 rounded-2xl bg-amber-300/50 blur-xl" aria-hidden="true" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white shadow-lg">
                      <FaGithub size={32} aria-hidden="true" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black leading-tight tracking-tight text-amber-950 sm:text-3xl">
                    PESU Placement Tales is now{" "}
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                      open source
                    </span>
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-base">{NOTE_BODY}</p>
                </div>
              </ModalBody>
              <ModalFooter className="flex-col-reverse gap-3 pb-7 pt-6 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-amber-300 bg-white/70 px-6 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  Let&apos;s go
                </button>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-amber-600 hover:to-yellow-600"
                >
                  <FaGithub size={16} aria-hidden="true" />
                  Contribute on GitHub
                </a>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
