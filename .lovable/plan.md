

# Security Review Results

The scan found **6 security issues** (3 errors, 3 warnings). Here is the full analysis and remediation plan.

---

## Critical Issues (Errors)

### 1. Unrestricted public INSERT on `registrations` table
**Risk**: Anyone can insert fake registrations with sensitive data (CPF, email, birth date) without any authentication or validation. This enables spam, data pollution, and potential abuse.

**Fix**: Add client-side input validation using Zod (CPF format, email format, CEP format, name length limits). On the database side, add a rate-limiting mechanism or move the insert logic to an edge function that validates inputs server-side before inserting.

### 2. Unrestricted public INSERT on `sales` table
**Risk**: Same issue -- anyone can insert fraudulent sale records without authentication. A malicious user could flood the sales table with fake purchase data.

**Fix**: Move sale creation to an edge function that validates the data (product exists, price matches, input formats correct) before inserting with the service role key. The client should call the edge function instead of inserting directly.

### 3. `has_role` function information disclosure
**Risk**: The `has_role` function is `SECURITY DEFINER` and accepts any `_user_id`. A malicious user could call `has_role(some_uuid, 'admin')` to probe which users are admins.

**Fix**: This is a low-practical-risk issue since knowing someone is an admin doesn't grant access, but it can be hardened by adding `auth.uid()` validation inside the function or revoking public EXECUTE permission.

---

## Warnings

### 4. RLS policies with `WITH CHECK (true)` on `registrations` and `sales`
Related to issues 1 and 2 above. The `WITH CHECK (true)` policies allow unrestricted inserts.

### 5. Leaked password protection disabled
**Risk**: Supabase can check new passwords against known breached password databases. This is currently disabled.

**Fix**: Enable it in the Supabase dashboard under Authentication > Settings > Security.

---

## Additional Issues Found in Code Review

### 6. No client-side input validation on forms
Both the registration form (`Inscricao.tsx`) and the shop checkout form (`Loja.tsx`) have zero input validation beyond HTML `required`. No CPF format check, no name length limit, no CEP format check.

**Fix**: Add Zod schemas to validate CPF (11 digits), CEP (8 digits), email format, name length (max 100 chars), and birth date range.

### 7. Registration form doesn't actually save to database
The `Inscricao.tsx` form shows a success toast but never calls Supabase. This is a functional gap, not a security issue, but worth noting.

### 8. Admin route has no route guard
The `/admin` route relies on a `useEffect` to check auth and redirect. During the brief loading period, the component renders. This is minor but could be improved with a proper auth guard wrapper.

---

## Recommended Implementation Plan

### Step 1: Add client-side input validation with Zod
- Create validation schemas for registration and checkout forms
- Validate CPF format (###.###.###-##), CEP format (#####-###), email, name length
- Display clear error messages in Portuguese

### Step 2: Create edge functions for secure data insertion
- **`create-registration`** edge function: validates inputs server-side, checks for duplicate CPF, inserts with service role
- **`create-sale`** edge function: validates inputs, verifies product exists and price matches, inserts with service role
- Update RLS: remove `WITH CHECK (true)` from public INSERT policies, restrict inserts to service role only

### Step 3: Harden the `has_role` function
- Add `IF _user_id != auth.uid() THEN RETURN false` check, or revoke public EXECUTE and rely on RLS policies calling it internally

### Step 4: Enable leaked password protection
- Toggle in Supabase Dashboard > Authentication > Settings

### Step 5: Tighten the admin route
- Wrap `/admin` in an auth guard component that shows nothing until auth is confirmed

