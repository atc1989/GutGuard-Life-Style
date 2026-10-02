import LifestyleLanding from "@/components/prototype/LifestyleLanding";

/** The approved landing (Addendum 05), drawn on the server so it shows at once. */
export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return <LifestyleLanding initialLogin={params.login !== undefined} />;
}
