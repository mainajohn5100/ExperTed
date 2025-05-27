import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  className?: string;
  actions?: React.ReactNode;
}

export function PageTitle({ title, className, actions }: PageTitleProps) {
  return (
    <div className={cn("mb-6 flex flex-col md:flex-row md:items-center md:justify-between", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      {actions && <div className="mt-4 md:mt-0">{actions}</div>}
    </div>
  );
}
