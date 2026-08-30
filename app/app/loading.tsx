import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="gg-page-loading">
      <Spinner label="Loading your page" />
    </div>
  );
}
