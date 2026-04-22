import { createClient } from "@/lib/supabase-server";

export interface UploadMediaOptions {
  file: File;
  bucket: string;
  folder?: string;
}

export interface UploadMediaResult {
  url: string;
  path: string;
}

/**
 * Centralised media upload utility.
 * Use this in ALL server actions and route handlers that handle file uploads.
 * Never call supabase.storage directly from page/component code.
 */
export async function uploadMedia({
  file,
  bucket,
  folder = "uploads",
}: UploadMediaOptions): Promise<UploadMediaResult> {
  const supabase = await createClient();

  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { url: publicUrl, path: data.path };
}
