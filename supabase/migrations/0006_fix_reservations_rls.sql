-- 예약 테이블 RLS 정책 수정
-- 기존 정책 삭제
drop policy if exists p_reservations_user_crud on public.reservations;
drop policy if exists p_reservations_seller_read on public.reservations;

-- 새로운 정책 생성 - 모든 사용자가 예약 생성 가능하도록 수정
create policy p_reservations_insert_all on public.reservations 
  for insert with check (true);

create policy p_reservations_select_user on public.reservations 
  for select using (
    auth.uid() = user_id or 
    auth.jwt() ->> 'role' = 'admin' or
    exists (select 1 from public.stores s where s.id = reservations.store_id and s.seller_id = auth.uid())
  );

create policy p_reservations_update_user on public.reservations 
  for update using (
    auth.uid() = user_id or 
    auth.jwt() ->> 'role' = 'admin'
  ) with check (
    auth.uid() = user_id or 
    auth.jwt() ->> 'role' = 'admin'
  );

create policy p_reservations_delete_user on public.reservations 
  for delete using (
    auth.uid() = user_id or 
    auth.jwt() ->> 'role' = 'admin'
  );
