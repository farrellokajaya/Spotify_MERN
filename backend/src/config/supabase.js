import { createClient } from "@supabase/supabase-js";

const requiredSupabaseEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

let supabaseClient = null;

const getMissingSupabaseEnv = () => {
  return requiredSupabaseEnv.filter((key) => !process.env[key]);
};

const normalizeSupabaseUrl = (url) => {
  return url.trim().replace(/\/+$/g, "");
};

const validateSupabaseUrl = (url) => {
  if (!url.startsWith("https://")) {
    throw new Error(
      "SUPABASE_URL harus diawali https://, contoh: https://project-ref.supabase.co",
    );
  }

  if (!url.endsWith(".supabase.co")) {
    throw new Error(
      "SUPABASE_URL salah. Gunakan Project URL saja, contoh: https://project-ref.supabase.co",
    );
  }

  if (url.includes("/storage/v1") || url.includes("/dashboard")) {
    throw new Error(
      "SUPABASE_URL tidak boleh berisi /storage/v1 atau /dashboard. Gunakan Project URL saja.",
    );
  }
};

const getSupabaseClient = () => {
  const missingEnv = getMissingSupabaseEnv();

  if (missingEnv.length > 0) {
    throw new Error(
      `Supabase credential belum lengkap: ${missingEnv.join(", ")}`,
    );
  }

  const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY.trim();

  validateSupabaseUrl(supabaseUrl);

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
};

export default getSupabaseClient;