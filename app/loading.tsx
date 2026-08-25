import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="gg-page-loading" role="status" aria-live="polite">
      <Spinner label="Loading" />
    </div>
  );
}
