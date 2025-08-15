"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { z } from "zod";

const profileSchema = z.object({
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  skills: z.array(z.string()).optional(),
});

type Profile = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
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

      if (!res.ok) throw new Error("Failed to update profile");
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
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
    return <div className="p-6">Please sign in to view your profile.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-gray-600">Manage your professional profile</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
              Professional Headline
            </label>
            <input
              type="text"
              id="headline"
              name="headline"
              defaultValue={profile?.headline || ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
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
              defaultValue={profile?.bio || ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={profile?.location || ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
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
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
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
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
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
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
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
              defaultValue={profile?.skills?.join(", ") || ""}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              placeholder="React, Node.js, Python (comma separated)"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
