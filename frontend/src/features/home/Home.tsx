import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    // Parent container needs to be relative
    <div className="relative h-screen w-full">
      
      {/* 1. Background Image */}
      <img
        src="/home-bg.jpg"
        alt="Library background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      {/* 2. Dark Overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* 3. Content (on top) */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Welcome to StudyLand
        </h1>
        
        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-200 sm:text-xl">
          Track your progress, manage your sessions, and conquer your goals. All
          in one simple, elegant space.
        </p>
        
        <div className="mt-10">
          {/* Use 'secondary' variant so it stands out on the dark bg */}
          <Button asChild size="lg" variant="secondary" className="text-lg">
            <Link to="/dashboard">Start Studying</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}