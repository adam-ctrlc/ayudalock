import { View } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/lib/auth/context";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text variant="caption">{label}</Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

export function AccountScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function onSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <Screen edges={[]}>
      <Text variant="title">Account</Text>
      <Card>
        <CardContent>
          <Row label="Name" value={user?.name ?? "-"} />
          <Row label="Email" value={user?.email ?? "-"} />
          <Row label="Role" value={user?.role ?? "-"} />
          {user?.phil_sys_id ? (
            <Row label="PhilSys ID" value={user.phil_sys_id} />
          ) : null}
          {user?.phone ? <Row label="Phone" value={user.phone} /> : null}
        </CardContent>
      </Card>
      <Button variant="destructive" label="Sign out" onPress={onSignOut} />
    </Screen>
  );
}
