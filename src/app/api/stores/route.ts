import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const q = searchParams.get('q')?.trim();
  const sortBy = searchParams.get('sortBy') || 'created_at.desc';
  const cursor = searchParams.get('cursor');
  const limit = Number(searchParams.get('limit') ?? '15');

  let query = supabase.from('stores').select('*').order('created_at', { ascending: false }).limit(limit);
  if (id) {
    const { data, error } = await supabase.from('stores').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? null);
  }
  if (q) {
    // 간단 검색: name, address like
    query = query.ilike('name', `%${q}%`);
  }
  if (sortBy) {
    const [col, dir] = sortBy.split('.') as [string, 'asc' | 'desc'];
    if (col) query = query.order(col, { ascending: dir !== 'desc' });
  }
  if (cursor) {
    query = query.lt('created_at', cursor);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const nextCursor = data && data.length === limit ? data[data.length - 1].created_at : null;
  return NextResponse.json({ items: data ?? [], nextCursor });
}


