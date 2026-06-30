# Data Model & Storage Design: SmartBazaar V3 — Full Serverless Vercel Architecture

This document specifies the database schemas, Supabase Storage buckets, Row Level Security (RLS) policies, and data constraints for the serverless deployment.

---

## 1. STORAGE BUCKET DEFINITIONS

| Bucket Name | Access Type | Allowed File Types | Max File Size | Owner Write | Admin Access |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`listings`** | Publicly Readable | `image/jpeg`, `image/png`, `image/webp` | 5 MB | Yes (Authenticated) | Full Access |
| **`verifications`** | Private | `application/pdf`, `image/jpeg`, `image/png` | 10 MB | Yes (Authenticated) | Full Access |

---

## 2. ROW LEVEL SECURITY (RLS) POLICIES

To secure client-direct database queries from Supabase JS, all tables MUST enable RLS. Below are the core security policies:

### Table: `users`
* **RLS Status**: Enabled
* **Policies**:
  - `Allow public read of profiles`: `CREATE POLICY select_user ON public.users FOR SELECT USING (true);`
  - `Allow owner update of profile`: `CREATE POLICY update_user ON public.users FOR UPDATE USING (auth.uid() = id);`

### Table: `listings`
* **RLS Status**: Enabled
* **Policies**:
  - `Allow public read of active listings`: `CREATE POLICY select_listing ON public.listings FOR SELECT USING (status = 'Active');`
  - `Allow seller insert of listing`: `CREATE POLICY insert_listing ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);`
  - `Allow seller update of listing`: `CREATE POLICY update_listing ON public.listings FOR UPDATE USING (auth.uid() = seller_id);`

### Table: `conversations`
* **RLS Status**: Enabled
* **Policies**:
  - `Allow participants to read`: `CREATE POLICY select_conv ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);`
  - `Allow participants to create`: `CREATE POLICY insert_conv ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);`

### Table: `messages`
* **RLS Status**: Enabled
* **Policies**:
  - `Allow conversation participants to read messages`: `CREATE POLICY select_msg ON public.messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())));`
  - `Allow sender to insert message`: `CREATE POLICY insert_msg ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);`

### Table: `offers`
* **RLS Status**: Enabled
* **Policies**:
  - `Allow buyer or seller to read offers`: `CREATE POLICY select_offer ON public.offers FOR SELECT USING (auth.uid() = buyer_id OR EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND l.seller_id = auth.uid()));`
  - `Allow buyer to insert offer`: `CREATE POLICY insert_offer ON public.offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);`

### Table: `seller_verifications` and `verification_documents`
* **RLS Status**: Enabled
* **Policies**:
  - `Allow owner to view`: `CREATE POLICY select_verification ON public.seller_verifications FOR SELECT USING (auth.uid() = seller_id);`
  - `Allow admin to read/update all`: `CREATE POLICY admin_verification ON public.seller_verifications FOR ALL USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.is_admin = true));`

---

## 3. DATABASE SCHEMA TRANSITIONS
All 38 existing PostgreSQL tables deployed during the V2 setup will be reused. The only changes are authentication link mappings:
1. `auth.users` (Supabase System Auth table) -> `public.users` (SmartBazaar application profiles table).
2. A trigger is established on `auth.users` to automatically sync user creation into `public.users` when a registration completes:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, is_admin, is_suspended, created_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', false, false, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
This guarantees user synchronization between authentication and application schemas.
