import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    // 1. Set a hard background color here (bg-zinc-900 or bg-black).
    // This renders IMMEDIATELY, killing the white flash.
    <div className="relative h-screen w-full bg-zinc-900">
      
      {/* 2. The Image: No state, no opacity transitions. 
          Just load it as fast as possible. */}
      <img
        src="/home-bg.webp"
        alt="Library background"
        // 'eager' tells the browser to prioritize this image
        loading="eager"
        // 'sync' tries to decode it immediately (good for hero images)
        decoding="sync"
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      {/* 3. Dark Overlay: Ensures text readability even if image fails */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* 4. Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Welcome to StudyLand
        </h1>
        
        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-200 sm:text-xl">
          Track your progress, manage your sessions, and conquer your goals. All
          in one simple, elegant space.
        </p>
        
        <div className="mt-10">
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <Link to="/dashboard">Start Studying</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}