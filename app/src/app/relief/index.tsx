import { RoleGate } from "@/components/role-gate";
import { ReliefAdmin } from "@/components/relief-admin";

export default function Relief() {
  return (
    <RoleGate role="lgu_admin">
      <ReliefAdmin />
    </RoleGate>
  );
}
