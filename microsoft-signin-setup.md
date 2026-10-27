# Microsoft sign-in: setup steps

The code for "Sign in with Microsoft" is already in the site, but hidden. It only shows in a browser where `?signin=on` has been used. It will not work until Part A (school IT) and Part B (teacher) are done. Do not send any secret by ordinary email or put it in the project.

Facts used below:
- Supabase project address: `https://flfywjedhwbvdiukvkoo.supabase.co`
- Site address: `https://gca-revise.github.io/`

---

## Part A: for school IT (Microsoft Entra ID / Azure AD)

We ask for a single-tenant app registration so that only accounts in the school's own directory can sign in. The app only reads the signed-in person's name and email address. It does not read mail, files or anything else.

1. Sign in to https://entra.microsoft.com as an administrator who can register applications.
2. Go to **Identity > Applications > App registrations > New registration**.
3. Name: `GCA Revise`.
4. Supported account types: **Accounts in this organizational directory only (single tenant)**.
5. Redirect URI: platform **Web**, value exactly:
   `https://flfywjedhwbvdiukvkoo.supabase.co/auth/v1/callback`
6. Click **Register**.
7. On the app's **Overview** page, copy the **Application (client) ID** and the **Directory (tenant) ID**.
8. Go to **API permissions**. Check these are present as **Microsoft Graph, Delegated** permissions: `User.Read`, `openid`, `email`, `profile`. (`User.Read` is added by default; add the others with **Add a permission > Microsoft Graph > Delegated permissions**.)
9. Click **Grant admin consent for <school name>** and confirm. All four should show a green tick.
10. Go to **Certificates & secrets > Client secrets > New client secret**. Description `GCA Revise`, choose an expiry (6 to 24 months). Click **Add**.
11. Copy the secret **Value** straight away. It is only shown once. (Do not copy the "Secret ID".)
12. Optional but tidy: under **Token configuration**, add the optional claim `email` for ID tokens. Under **Properties**, set "Assignment required" to Yes and assign only the intended students and staff, if the school wants to limit who can sign in.

**Please send back, to the teacher, by a secure route (not plain email):**
1. Application (client) ID
2. Directory (tenant) ID
3. Client secret value
4. Client secret expiry date (so we can renew it before it stops working)

---

## Part B: for the teacher (Supabase dashboard)

Only do this once IT has sent the four items and the school's data protection officer has agreed.

1. Open the Supabase dashboard (https://supabase.com/dashboard) and choose the `gca-revise` project.
2. Go to **Authentication > Sign In / Providers** and open **Azure**.
3. Switch it **on**. Fill in:
   - **Application (client) ID**: from IT.
   - **Secret Value**: from IT.
   - **Azure Tenant URL**: `https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0` (put the real tenant ID in place of the part in angle brackets).
4. Click **Save**.
5. Go to **Authentication > URL Configuration**:
   - **Site URL**: `https://gca-revise.github.io/`
   - **Redirect URLs**: list only `https://gca-revise.github.io/` (add `http://localhost:8765/` only while testing). No wildcards (no `*`).
6. Test: open `https://gca-revise.github.io/?signin=on`, click **Sign in with Microsoft**, sign in with a school account. You should come back to the site showing "Signed in".
7. Once Microsoft works: go to **Authentication > Sign In / Providers**, open **Email** and turn off **Allow new users to sign up**. (Otherwise anyone with any email address could still create an account.) Also delete the two old test accounts under **Authentication > Users**.
8. Put a reminder in your diary for the secret expiry date. When it expires, IT creates a new secret and you paste it into the Azure box (step 3).

When ready for students, the sign-in is switched on for everyone by a small code change (it is currently hidden behind `?signin=on`). Ask Claude to do that, after the school paperwork is signed off.
