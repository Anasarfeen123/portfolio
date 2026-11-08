import { buildInfo } from "@/data/build-info";
import { ScrollExperience } from "@/components/ScrollExperience";

export const metadata = {
  title: "Classic Portfolio | Anas Arfeen",
  description: "The complete classic portfolio of Anas Arfeen.",
};

export default function ClassicPage() {
  return <ScrollExperience buildInfo={buildInfo} />;
}
