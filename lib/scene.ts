/** Which 3D composition the shared background canvas shows for a slide. */
export type SceneMode = "hotel-cover" | "hotel-close" | "rings" | "rings-alt" | "geometry" | "none";

export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    const ok = !!gl;
    // Free the probe context right away.
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}
