/* Supabase project connection.
 *
 * Both values below are safe to publish. SUPABASE_ANON_KEY is the publishable
 * key row-level security exists to constrain, not a secret; it is meant to
 * sit in a browser bundle. It is NOT the service_role key, which bypasses RLS
 * entirely and must never appear in any file that ships to the site.
 *
 * Empty strings mean "not connected yet" — the admin page and the live
 * catalogue both fall back to the local designs in collection.js until real
 * values are filled in here, rather than failing outright.
 */
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
