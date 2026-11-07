import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ProfilePage from "./page";

const signIn = vi.fn();
let session: { data: unknown; status: string } = { data: null, status: "unauthenticated" };
const signedIn = { data: { user: { name: "A" } }, status: "authenticated" };
vi.mock("next-auth/react", () => ({
  useSession: () => session,
  signIn: (...args: unknown[]) => signIn(...args),
}));

beforeEach(() => {
  signIn.mockReset();
  session = { data: null, status: "unauthenticated" };
});
afterEach(() => vi.unstubAllGlobals());

describe("/profile when signed out", () => {
  it("asks the user to sign in and offers the Google button", () => {
    render(<ProfilePage />);
    expect(screen.getByText("Please sign in to view your profile.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Profile" })).not.toBeInTheDocument();
  });

  it("starts Google sign-in when the button is clicked", () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in with Google" }));
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/profile" });
  });
});

describe("/profile when signed in", () => {
  it("on load failure hides the form (no overwrite risk) and Retry recovers", async () => {
    session = signedIn;
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValue({ ok: true, status: 200, json: async () => ({ headline: "Dev" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<ProfilePage />);
    expect(await screen.findByText(/could not load your profile/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save Profile" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("button", { name: "Save Profile" })).toBeInTheDocument();
    expect(screen.queryByText(/could not load your profile/i)).not.toBeInTheDocument();
  });

  it("shows first-run guidance for an empty profile", async () => {
    session = signedIn;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
    );
    render(<ProfilePage />);
    expect(await screen.findByText(/upload a resume/i)).toBeInTheDocument();
  });
});
