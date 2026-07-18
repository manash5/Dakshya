"use client";

import dynamic from "next/dynamic";

const CareerScrollExperience = dynamic(() => import("./CareerScrollExperience"), {
  ssr: false,
  loading: () => (
    <div id="how-it-works" className="flex h-screen w-full items-center justify-center bg-white">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-48 animate-pulse rounded-lg bg-neutral-100" />
        <div className="mx-auto h-6 w-64 animate-pulse rounded-lg bg-neutral-100" />
      </div>
    </div>
  ),
});

interface HowItWorksSectionProps {
  isAuthenticated: boolean;
}

export default function HowItWorksSection({ isAuthenticated }: HowItWorksSectionProps) {
  return (
    <div id="how-it-works">
      <CareerScrollExperience isAuthenticated={isAuthenticated} />
    </div>
  );
}
