import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LessonsIndexPage() {
  const session = await getServerSession(authOptions);
  const track = session?.user?.preferredTrack;
  if (track) {
    redirect(`/lessons/${track.toLowerCase()}`);
  }
  redirect("/lessons/foundations");
}
