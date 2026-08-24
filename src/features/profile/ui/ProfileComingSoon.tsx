import {
  PROFILE_BODY,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";

type ProfileComingSoonProps = {
  title: string;
  message: string;
};

export function ProfileComingSoon({ title, message }: ProfileComingSoonProps) {
  return (
    <section className={PROFILE_SECTION}>
      <h1 className={`mb-3 ${PROFILE_SECTION_TITLE}`}>{title}</h1>
      <p className={PROFILE_BODY}>{message}</p>
    </section>
  );
}
