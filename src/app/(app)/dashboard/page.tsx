import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const analyses = await prisma.analysis.findMany({
    where: { resume: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {analyses.length === 0 ? (
        <p className="text-muted-foreground">No analyses yet.</p>
      ) : (
        <ul className="space-y-2">
          {analyses.map((a) => (
            <li key={a.id} className="border rounded p-3">
              <div className="text-sm">Score: {a.score}</div>
              <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

