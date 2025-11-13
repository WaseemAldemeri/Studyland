import { Spinner } from "@/components/shared/Spinner";

export function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}