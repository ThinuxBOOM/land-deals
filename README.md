# Field & Found

A Next.js App Router property listings site with Supabase Auth, Postgres, and Storage.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add your Supabase project URL and anon key.
3. Run the SQL in `supabase/migrations/202611240001_initial_schema.sql` in the Supabase SQL editor (or apply it with the Supabase CLI).
4. Create an admin email/password user in Supabase Authentication. Public sign-up is not exposed by this app.
5. Grant the account the private admin app-metadata role from a trusted SQL session (replace the email):

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   where email = 'admin@example.com';
   ```

   Sign out and back in after changing the role so the refreshed JWT includes it.
6. Run `npm run dev`.

The migration creates the `property-images` public bucket and enables row-level security. Listing management and uploads require both authentication and the `app_metadata.role = admin` claim. Keep account creation and role grants restricted to trusted operators.

## Notes

- Property images are uploaded to `property-images/<property-id>/...` and stored as public URLs.
- Public property pages increment view totals through the `increment_property_views` RPC. A browser session records each property once to avoid counting refreshes.
- Configure the broker name, email, WhatsApp number, and optional Facebook/Instagram links in **Admin → Site settings**.
- Add listing features and amenities as comma-separated values in the property editor.
- The database uses USD formatting for listing prices; adjust the currency in the UI if your market uses a different currency.
