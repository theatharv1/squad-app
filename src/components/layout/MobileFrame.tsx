import { ReactNode } from "react";

export function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex justify-center grain-overlay">
      <div className="w-full max-w-[430px] min-h-screen relative bg-grain overflow-hidden">
        {children}
      </div>
    </div>
  );
}
