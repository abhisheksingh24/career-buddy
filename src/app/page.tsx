import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, User, Upload } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Career Buddy</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered resume optimization and career guidance. Upload your resume, analyze it against
          job descriptions, and get personalized suggestions to land your dream job.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Manage your professional profile and upload your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/profile">Manage Profile</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </CardTitle>
            <CardDescription>View your analysis history and track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/dashboard">View Dashboard</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analyze
            </CardTitle>
            <CardDescription>Analyze your resume against any job description</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/analyze">Start Analysis</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload
            </CardTitle>
            <CardDescription>Upload and parse resume files (PDF, DOCX, TXT)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a href="/upload">Upload Resume</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-medium">Upload Resume</h3>
            <p className="text-sm text-gray-600">
              Upload your resume to your profile for easy access
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-medium">Analyze Job</h3>
            <p className="text-sm text-gray-600">Paste any job description to analyze your match</p>
          </div>
          <div className="space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-medium">Get Insights</h3>
            <p className="text-sm text-gray-600">
              Receive AI-powered suggestions and improvement tips
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
