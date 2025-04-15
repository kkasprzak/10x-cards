import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const DEFAULT_USER_ID = "b8608e81-0e6b-41f9-828c-e2622eaf41e1";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
