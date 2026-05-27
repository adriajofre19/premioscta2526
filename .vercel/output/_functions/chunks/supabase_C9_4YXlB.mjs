import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mlrjeeghwuboxojyndbz.supabase.co";
const supabaseKey = "sb_publishable_YuZJGO64CC1fxHECB7HLGQ_ZXiwvuGC";
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase as s };
