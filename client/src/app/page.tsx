"use client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-neutral-950 text-black dark:text-white px-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          AxiomDAO
        </h1>
        <p className="text-lg md:text-xl mb-6">
          AI-Driven Governance for Decentralized Data Integrity
        </p>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  );
}
