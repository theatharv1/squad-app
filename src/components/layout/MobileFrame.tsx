import { ReactNode } from "react";

export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative bg-background">
        {children}
      </div>
    </div>
  );
}
