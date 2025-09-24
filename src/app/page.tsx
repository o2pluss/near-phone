"use client";

import dynamic from "next/dynamic";

const ImportedApp = dynamic(() => import("@/App"), {
  ssr: false,
});

export default function Home() {
  return <ImportedApp />;
}
