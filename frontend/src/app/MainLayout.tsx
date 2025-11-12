import { Toaster } from "@/components/ui/sonner";
import NavBar from "./layout/NavBar";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { fadeVariants } from "@/lib/utils/animations";

export default function MainLayout() {
  const location = useLocation();
  return (
    <div className="font-mono antialiased">
      <Toaster
        position="bottom-right"
        duration={3000}
        richColors
        theme="light"
      />
      <NavBar />
      <main className="container mx-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // This is CRITICAL
            variants={fadeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1" // Ensure it takes up space
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
