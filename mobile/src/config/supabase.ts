/**
 * Supabase client for mobile — used for Storage uploads only.
 * Auth is handled by the backend (email lookup), not Supabase Auth.
 *
 * Fill in your project URL and anon key from:
 *   Supabase Dashboard → Project Settings → API
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://fjgfnwrsgqzqkmiprdjg.supabase.co";           // e.g. https://xyzxyz.supabase.co
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ2Zud3JzZ3F6cWttaXByZGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjQ3MjEsImV4cCI6MjA5MTMwMDcyMX0.gcDVuMtn-ubxh8uzJW37-EzPg9Q8V4WPrO-uUdG18CA"; // public anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
