const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_ANON_KEY) no arquivo .env"
  );
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("sb_publishable_")) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY está com a chave "publishable" (pública). ' +
      "No Supabase: Settings → API → copie a chave service_role (secret), não a publishable."
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

module.exports = supabase;
