import { getPaginatedEvents } from "../lib/getDatas";
import { getPaginatedGalleries } from "../lib/getDatas";
import { getPaginatedNotices } from "../lib/getDatas";
import { getPaginatedPosts } from "../lib/getDatas";
import { getPaginatedStudents } from "../lib/getDatas";

import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import GallerySection from "@/components/GallerySection";
import NoticeSection from "@/components/NoticeSection";
import PostsSection from "@/components/PostsSection";
import NewMemberSection from "@/components/NewMemberSection";

export const dynamic = "force-static"; // Optional: forces static + ISR

export default async function Home() {
  const [
    { events, total: eventTotal },
    { galleries },
    { notices },
    { posts },
    { students, total },
  ] = await Promise.all([
    getPaginatedEvents({ page: 1, limit: 2 }),
    getPaginatedGalleries({ page: 1, limit: 2 }),
    getPaginatedNotices({ page: 1, limit: 2 }),
    getPaginatedPosts({ page: 1, limit: 2 }),
    getPaginatedStudents({ page: 1, limit: 2, isActive: true }),
  ]);

  return (
    <main className="mx-auto space-y-8">
      <HeroSection
        total={total}
        eventTotal={eventTotal}
        schoolName="Chanchaitara Madla United High School"
      />
      <EventsSection events={JSON.parse(JSON.stringify(events))} />
      <GallerySection gallery={JSON.parse(JSON.stringify(galleries))} />
      <NoticeSection notices={JSON.parse(JSON.stringify(notices))} />
      <PostsSection posts={JSON.parse(JSON.stringify(posts))} />
      <NewMemberSection members={JSON.parse(JSON.stringify(students))} />
    </main>
  );
}
