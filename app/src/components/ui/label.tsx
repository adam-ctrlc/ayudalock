import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

export function Label({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text variant="label" className={cn("mb-1.5", className)}>
      {children}
    </Text>
  );
}
