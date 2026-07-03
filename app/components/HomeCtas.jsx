"use client";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";

export default function HomeCtas() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button size="lg" onPress={() => router.push("/browse")}>
        Browse companies
      </Button>
      <Button
        size="lg"
        variant="secondary"
        onPress={() => router.push("/add-student")}
      >
        Share your story
      </Button>
    </div>
  );
}
