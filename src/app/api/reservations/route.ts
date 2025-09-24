import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit') ?? '15');

  let query = supabase
    .from('reservations')
    .select('*')
    .order('reservation_date', { ascending: false })
    .order('reservation_time', { ascending: false })
    .limit(limit);

  if (userId) query = query.eq('user_id', userId);
  if (cursor) query = query.lt('created_at', cursor);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;
  return NextResponse.json({ items: data ?? [], nextCursor });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from('reservations').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}


