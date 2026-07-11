import { Pressable } from "react-native";
import { Link, type Href } from "expo-router";

import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";

export function TextLink({
  href,
  children,
  className,
}: {
  href: Href;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <Text className={cn("font-medium text-primary", className)}>
          {children}
        </Text>
      </Pressable>
    </Link>
  );
}
