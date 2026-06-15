import { Activity, BarChart3, Brain, Workflow } from "lucide-react";
import type { ReactNode } from "react";

type ShellProps = {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
};

const navItems = [
  { label: "Home", path: "/", icon: Brain },
  { label: "Detect", path: "/detect", icon: Activity },
  { label: "Research", path: "/research", icon: BarChart3 },
  { label: "Pipeline", path: "/pipeline", icon: Workflow },
];

export function Shell({ children, currentPath, onNavigate }: ShellProps) {
  return (
    <div className="min-h-screen bg-clinical-bg text-clinical-ink">
      <header className="border-b border-clinical-line bg-white/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => onNavigate("/")}
            type="button"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-clinical-blue">
              <Brain className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold">Alzheimer MRI Classification</span>
              <span className="block text-sm text-clinical-muted">
                ResNet50 research interface
              </span>
            </span>
          </button>

          <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.path;

              return (
                <button
                  key={item.path}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-clinical-blue"
                      : "text-clinical-muted hover:bg-slate-100 hover:text-clinical-ink"
                  }`}
                  onClick={() => onNavigate(item.path)}
                  type="button"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
