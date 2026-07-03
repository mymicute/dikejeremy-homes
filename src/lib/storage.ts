import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads a file to the private `media` bucket under `<userId>/<folder>/…` and returns a long-lived signed URL. */
export async function uploadMedia(
  userId: string,
  folder: string,
  file: File,
): Promise<{ path: string; url: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (error || !data) throw error ?? new Error("Could not create signed URL");
  return { path, url: data.signedUrl };
}
