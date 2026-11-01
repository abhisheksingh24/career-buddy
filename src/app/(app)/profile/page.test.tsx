import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProfilePage from "./page";

const signIn = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: (...args: unknown[]) => signIn(...args),
}));

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
    expect(signIn).toHaveBeenCalledWith("google");
  });
});
