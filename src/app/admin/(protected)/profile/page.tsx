import type { Metadata } from "next";
import { getFile } from "@/lib/github-content";
import { PROFILE_PATH } from "@/lib/profile-validation";
import type { Profile } from "@/data/portfolio";
import { ProfileEditor } from "@/components/admin/ProfileEditor";

export const metadata: Metadata = { title: "Admin — Profile", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const file = await getFile(PROFILE_PATH);
  const profile: Profile = file
    ? JSON.parse(file.content)
    : {
        name: "",
        handle: "",
        avatar: "",
        role: "",
        statement: "",
        bio: "",
        location: "",
        email: "",
        github: "",
        linkedin: "",
        portfolio: "",
        resume: "",
        education: "",
        highlights: [],
      };

  return (
    <ProfileEditor
      initialProfile={{
        ...profile,
        highlights: profile.highlights.map((h) => `${h.label} | ${h.value}`).join("\n"),
      }}
    />
  );
}
