import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-clinical-teal">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-normal text-clinical-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-clinical-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
