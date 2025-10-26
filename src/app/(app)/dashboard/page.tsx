import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TrendingUp, Calendar, Building, FileText } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  const analyses = await prisma.resumeAnalysis.findMany({
    where: { resume: { portfolio: { userId: session.user.id } } },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      resume: {
        select: {
          name: true,
          fileType: true,
        },
      },
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Track your resume analysis history and performance</p>
      </div>

      {analyses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
              <p className="text-gray-500 mb-4">
                Start by analyzing your resume against a job description
              </p>
              <Button asChild>
                <a href="/analyze">Analyze Resume</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Analyses</h2>
            <Button variant="outline" asChild>
              <a href="/analyze">New Analysis</a>
            </Button>
          </div>

          <div className="grid gap-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        {analysis.jobTitle || "Job Analysis"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {analysis.jobDesc
                            ? analysis.jobDesc.substring(0, 50) + "..."
                            : "No job description"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(analysis.score || 0)}`}>
                        {Math.round(analysis.score || 0)}%
                      </div>
                      <Badge variant="outline" className={getScoreColor(analysis.score || 0)}>
                        {getScoreLabel(analysis.score || 0)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText className="h-4 w-4" />
                      <span>{analysis.resume.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {analysis.resume.fileType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysis.missing.length > 0 && (
                        <Badge variant="outline" className="text-yellow-600">
                          {analysis.missing.length} missing keywords
                        </Badge>
                      )}
                      {analysis.keywords.length > 0 && (
                        <Badge variant="outline" className="text-blue-600">
                          {analysis.keywords.length} skills identified
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
