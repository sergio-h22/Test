/* Supabase connection, and only that.
 *
 * The two values below are the ONLY things that need to change to go live:
 * a Project URL and the anon/public key from Supabase's dashboard under
 * Settings -> API. Do not put the service_role key here or anywhere else in
 * this repository. That key bypasses every row-level-security policy in
 * docs/supabase-setup.sql, and this file is served to every visitor's
 * browser: anything placed here is public the moment it is pushed.
 *
 * The anon key is safe to publish. It identifies the project, not a person;
 * what a request using it is allowed to do is entirely decided by the RLS
 * policies on the database, which is why docs/supabase-setup.sql exists and
 * must be run before this is filled in.
 *
 * Left blank, the site keeps reading assets/js/collection.js exactly as it
 * does today: nothing about the current live site changes on its own.
 */
const SUPABASE_CONFIG = {
  url: "",
  anonKey: ""
};

/* True only once both values above are real. Every other file checks this
   rather than the two fields directly, so "is Supabase on" is answered in
   one place. */
const SUPABASE_ENABLED = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
