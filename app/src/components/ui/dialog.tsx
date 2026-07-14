import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

type AlertOptions = { title?: string; message: string; confirmLabel?: string };

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type DialogConfig = {
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type DialogApi = {
  alert: (options: AlertOptions | string) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return ctx;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<DialogConfig | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((value: boolean) => {
    setConfig(null);
    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(value);
  }, []);

  const api = useMemo<DialogApi>(
    () => ({
      alert: (options) => {
        const opts =
          typeof options === "string" ? { message: options } : options;
        return new Promise<void>((resolve) => {
          resolver.current = () => resolve();
          setConfig({
            title: opts.title,
            message: opts.message,
            confirmLabel: opts.confirmLabel ?? "OK",
          });
        });
      },
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          resolver.current = resolve;
          setConfig({
            title: options.title,
            message: options.message,
            confirmLabel: options.confirmLabel ?? "Confirm",
            cancelLabel: options.cancelLabel ?? "Cancel",
            destructive: options.destructive,
          });
        }),
    }),
    [],
  );

  const isConfirm = config?.cancelLabel != null;

  return (
    <DialogContext.Provider value={api}>
      {children}
      <Modal
        visible={config != null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => close(false)}
      >
        <Pressable
          onPress={() => close(false)}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          className="flex-1 items-center justify-center p-6"
        >
          <Pressable
            onPress={() => {}}
            className="w-full max-w-sm gap-2 rounded-2xl border border-border bg-card p-5"
          >
            {config?.title ? (
              <Text variant="heading">{config.title}</Text>
            ) : null}
            {config?.message ? (
              <Text className="text-base leading-5 text-muted-foreground">
                {config.message}
              </Text>
            ) : null}
            <View className="mt-3 flex-row justify-end gap-2">
              {isConfirm ? (
                <Button
                  variant="outline"
                  className="min-w-[92px]"
                  label={config?.cancelLabel ?? "Cancel"}
                  onPress={() => close(false)}
                />
              ) : null}
              <Button
                variant={config?.destructive ? "destructive" : "default"}
                className="min-w-[92px]"
                label={config?.confirmLabel ?? "OK"}
                onPress={() => close(true)}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </DialogContext.Provider>
  );
}
