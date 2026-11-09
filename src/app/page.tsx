import { buildInfo } from "@/data/build-info";
import { ScrollExperience } from "@/components/ScrollExperience";

export default function Home() {
  return <ScrollExperience buildInfo={buildInfo} />;
}
