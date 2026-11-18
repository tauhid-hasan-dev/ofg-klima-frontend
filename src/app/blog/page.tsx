import { StaticPage, staticPageMetadata } from "@/components/layout/StaticPage";

export const metadata = staticPageMetadata("blog");

export default function Page() {
  return <StaticPage slug="blog" />;
}
