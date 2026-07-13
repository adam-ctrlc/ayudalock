import {
  Airplane,
  Basket,
  Briefcase,
  FileText,
  HandCoins,
  IdentificationCard,
  Receipt,
  Storefront,
} from "phosphor-react-native";

import type { GuideCategory } from "@/lib/api/guides";
import { PH_COLORS } from "@/lib/theme";

export const GUIDE_CATEGORY_LABEL: Record<GuideCategory, string> = {
  id: "IDs",
  benefit: "Benefits",
  document: "Documents",
  relief: "Relief",
  tax: "Tax & BIR",
  work: "Work",
  business: "Business",
  travel: "Travel",
};

export function GuideIcon({
  category,
  size = 20,
}: {
  category: GuideCategory;
  size?: number;
}) {
  switch (category) {
    case "id":
      return (
        <IdentificationCard size={size} color={PH_COLORS.blue} weight="duotone" />
      );
    case "benefit":
      return <HandCoins size={size} color={PH_COLORS.success} weight="duotone" />;
    case "relief":
      return <Basket size={size} color={PH_COLORS.red} weight="duotone" />;
    case "tax":
      return <Receipt size={size} color={PH_COLORS.blue} weight="duotone" />;
    case "work":
      return <Briefcase size={size} color={PH_COLORS.success} weight="duotone" />;
    case "business":
      return <Storefront size={size} color={PH_COLORS.red} weight="duotone" />;
    case "travel":
      return <Airplane size={size} color={PH_COLORS.blue} weight="duotone" />;
    default:
      return (
        <FileText size={size} color={PH_COLORS.mutedForeground} weight="duotone" />
      );
  }
}
