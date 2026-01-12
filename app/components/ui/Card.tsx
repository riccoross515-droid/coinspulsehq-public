import { cn } from "@/app/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-2xl border border-border shadow-sm transition-all duration-300",
        className
      )}
      {...props}
    />
  );
};
