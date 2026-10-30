import type { ReactNode } from "react";
import { Panel } from "../components/Panel";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  title,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b-4 border-dex-frame-dark bg-dex-accent py-3 text-center text-dex-lg text-white pixel-shadow-accent">
        PokéDex Manager
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Panel
          className="w-full max-w-md"
          contentClassName="p-6 sm:p-8"
          header={<h1>{title}</h1>}
        >
          {children}
          <p className="mt-6 border-t-2 border-dex-edge pt-4 text-center">
            {footer}
          </p>
        </Panel>
      </main>
    </div>
  );
}
