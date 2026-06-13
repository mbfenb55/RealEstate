alter table public.users enable row level security;
alter table public.shoots enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;

drop policy if exists "users_select_own" on public.users;
drop policy if exists "users_insert_own" on public.users;
drop policy if exists "users_update_own" on public.users;
drop policy if exists "users_delete_own" on public.users;

create policy "users_select_own"
on public.users
for select
using (auth.uid() = id);

create policy "users_insert_own"
on public.users
for insert
with check (auth.uid() = id);

create policy "users_update_own"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users_delete_own"
on public.users
for delete
using (auth.uid() = id);

drop policy if exists "shoots_select_own" on public.shoots;
drop policy if exists "shoots_insert_own" on public.shoots;
drop policy if exists "shoots_update_own" on public.shoots;
drop policy if exists "shoots_delete_own" on public.shoots;

create policy "shoots_select_own"
on public.shoots
for select
using (auth.uid() = user_id);

create policy "shoots_insert_own"
on public.shoots
for insert
with check (auth.uid() = user_id);

create policy "shoots_update_own"
on public.shoots
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "shoots_delete_own"
on public.shoots
for delete
using (auth.uid() = user_id);

drop policy if exists "payments_select_own" on public.payments;
drop policy if exists "payments_insert_own" on public.payments;
drop policy if exists "payments_update_own" on public.payments;
drop policy if exists "payments_delete_own" on public.payments;

create policy "payments_select_own"
on public.payments
for select
using (auth.uid() = user_id);

create policy "payments_insert_own"
on public.payments
for insert
with check (auth.uid() = user_id);

create policy "payments_update_own"
on public.payments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "payments_delete_own"
on public.payments
for delete
using (auth.uid() = user_id);

drop policy if exists "invoices_select_own" on public.invoices;
drop policy if exists "invoices_insert_own" on public.invoices;
drop policy if exists "invoices_update_own" on public.invoices;
drop policy if exists "invoices_delete_own" on public.invoices;

create policy "invoices_select_own"
on public.invoices
for select
using (auth.uid() = user_id);

create policy "invoices_insert_own"
on public.invoices
for insert
with check (auth.uid() = user_id);

create policy "invoices_update_own"
on public.invoices
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "invoices_delete_own"
on public.invoices
for delete
using (auth.uid() = user_id);
