import { StaticPage, staticPageMetadata } from "@/components/layout/StaticPage";

export const metadata = staticPageMetadata("hakkimizda");

export default function Page() {
  return <StaticPage slug="hakkimizda" />;
}
