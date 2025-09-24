import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const storeId = searchParams.get('storeId');
  let query = supabase.from('favorites').select('*');
  if (userId) query = query.eq('user_id', userId);
  if (storeId) query = query.eq('store_id', storeId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from('favorites').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  const storeId = searchParams.get('storeId');
  let query = supabase.from('favorites').delete();
  if (id) query = query.eq('id', id);
  else if (userId && storeId) query = query.eq('user_id', userId).eq('store_id', storeId);
  else return NextResponse.json({ error: 'Specify id or userId+storeId' }, { status: 400 });
  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}



