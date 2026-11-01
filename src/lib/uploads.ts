import { isAbsolute, join } from "path";

/**
 * Directory where uploaded resume files are stored. Defaults to `./uploads`;
 * dev instances set UPLOADS_DIR so parallel instances never share files.
 */
export function uploadsRoot(): string {
  const dir = process.env.UPLOADS_DIR || "uploads";
  return isAbsolute(dir) ? dir : join(process.cwd(), dir);
}
