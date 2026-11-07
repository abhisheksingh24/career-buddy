import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Explicit cleanup keeps component tests isolated from each other.
afterEach(() => cleanup());
