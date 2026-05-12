import { requireUser } from "@/lib/auth-helpers";
import { Nav } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div>
      <Nav userName={user.name} />
      <div className="container py-6">{children}</div>
    </div>
  );
}
