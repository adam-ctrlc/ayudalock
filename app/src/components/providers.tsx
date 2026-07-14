import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/query";
import { AuthProvider } from "@/lib/auth/context";
import { DialogProvider } from "@/components/ui/dialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DialogProvider>{children}</DialogProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
