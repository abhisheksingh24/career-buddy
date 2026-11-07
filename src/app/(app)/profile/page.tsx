"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROFILE_LIMITS, type ProfileInput } from "@/lib/profile-schema";
import { readUploadResponse, uploadedMessage } from "@/lib/upload-response";
import { FileText, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

type Profile = Partial<ProfileInput>;

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bioLength, setBioLength] = useState(0);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSaved = () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSaved(false);
  };

  // Resume management state
  const [resume, setResume] = useState<{
    id: string;
    name: string;
    rawText: string;
    fileType: string;
    createdAt: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | undefined>();

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchResume();
    } else if (status === "unauthenticated") {
      // Signed out: nothing to load, show the sign-in prompt.
      setIsLoading(false);
    }
  }, [session, status]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      setBioLength(data?.bio?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResume = async () => {
    try {
      const res = await fetch("/api/resume/active");
      if (res.ok) {
        const data = await res.json();
        setResume(data);
      }
    } catch (err) {
      console.error("Failed to fetch resume:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const outcome = await readUploadResponse(res);
      if (!outcome.ok) throw new Error(outcome.error);

      setUploadedName(outcome.fileName ?? file.name);
      setUploadSuccess(true);
      await fetchResume(); // Refresh resume data

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      clearSaved();
      const formData = new FormData(e.currentTarget);
      const data = {
        headline: formData.get("headline") as string,
        bio: formData.get("bio") as string,
        location: formData.get("location") as string,
        website: formData.get("website") as string,
        linkedin: formData.get("linkedin") as string,
        github: formData.get("github") as string,
        skills:
          formData
            .get("skills")
            ?.toString()
            .split(",")
            .map((s) => s.trim()) || [],
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          res.status === 400 && typeof body?.error === "string"
            ? body.error
            : "Failed to update profile",
        );
      }
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setSaved(true);
      savedTimer.current = setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div className="p-6 space-y-4">
        <p>Please sign in to view your profile.</p>
        <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-600">Manage your professional profile and resume</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="resume">Resume Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <form onSubmit={handleSubmit} onChange={clearSaved} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
                  Professional Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  name="headline"
                  maxLength={PROFILE_LIMITS.headline}
                  defaultValue={profile?.headline || ""}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full Stack Developer | AI Enthusiast"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={PROFILE_LIMITS.bio}
                  onChange={(e) => setBioLength(e.target.value.length)}
                  defaultValue={profile?.bio || ""}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {bioLength >= PROFILE_LIMITS.bio
                    ? `Limit reached: ${PROFILE_LIMITS.bio} characters. Extra text is cut off.`
                    : `${bioLength} / ${PROFILE_LIMITS.bio}`}
                </p>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  maxLength={PROFILE_LIMITS.location}
                  defaultValue={profile?.location || ""}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  defaultValue={profile?.website || ""}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://your-website.com"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  defaultValue={profile?.linkedin || ""}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                  GitHub
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  defaultValue={profile?.github || ""}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/your-username"
                />
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  aria-describedby="skills-hint"
                  defaultValue={profile?.skills?.join(", ") || ""}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="React, Node.js, Python"
                />
                <p id="skills-hint" className="mt-1 text-xs text-gray-500">
                  Separate skills with commas (up to {PROFILE_LIMITS.skills}, {PROFILE_LIMITS.skill}{" "}
                  characters each).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {saved && (
                <Alert role="status">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Profile saved</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="px-6 min-h-11">
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="resume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Current Resume
              </CardTitle>
              <CardDescription>Manage your active resume for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{resume.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Badge variant="outline">{resume.fileType}</Badge>
                          <span>Uploaded {new Date(resume.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Replace Resume
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No resume uploaded yet</p>
                  <label className="cursor-pointer">
                    <Button asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}

              {uploadSuccess && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="break-words">
                    {uploadedMessage(uploadedName)}
                  </AlertDescription>
                </Alert>
              )}

              {uploadError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {isUploading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
