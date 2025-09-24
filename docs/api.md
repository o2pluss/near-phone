# API Reference (local dev)

Base URL (local Next API): `http://localhost:3001`

Notes
- Pagination: cursor-based via `created_at` (unless otherwise stated)
- Page size: default 15 (`limit`)
- Auth: using local Supabase anon key; secure scopes to be added with RLS + auth middleware later

## Stores

GET `/api/stores`
- Query
  - `id?: string` — if provided, returns a single store
  - `q?: string` — name like search
  - `sortBy?: string` — e.g. `created_at.desc`, `rating.desc` (default: `created_at.desc`)
  - `cursor?: string` — ISO timestamp of `created_at` for next page
  - `limit?: number` — default 15
- Response (list)
```json
{
  "items": [
    { "id": "uuid", "name": "강남 모바일센터", "address": "...", "rating": 4.5, "review_count": 10, "created_at": "..." }
  ],
  "nextCursor": "2025-01-01T00:00:00.000Z"
}
```
- Response (single)
```json
{ "id": "uuid", "name": "강남 모바일센터", "address": "...", "rating": 4.5, "review_count": 10 }
```

## Store Products

GET `/api/store-products`
- Query
  - `storeId?: string`
  - `cursor?: string`
  - `limit?: number`
- Response
```json
{
  "items": [
    {
      "id": "uuid",
      "store_id": "uuid",
      "product_id": "uuid",
      "price": 890000,
      "discount_price": 850000,
      "conditions": "번호이동,카드할인",
      "products": { "id": "uuid", "name": "iPhone 15 Pro", "model": "A3100", "storage": "256GB" },
      "created_at": "..."
    }
  ],
  "nextCursor": null
}
```

## Reservations

GET `/api/reservations`
- Query
  - `userId?: string`
  - `cursor?: string`
  - `limit?: number`
- Response
```json
{
  "items": [
    { "id": "uuid", "user_id": "uuid", "store_id": "uuid", "reservation_date": "2025-01-02", "reservation_time": "14:30:00", "status": "pending", "created_at": "..." }
  ],
  "nextCursor": null
}
```

POST `/api/reservations`
- Body
```json
{
  "user_id": "uuid",
  "store_id": "uuid",
  "reservation_date": "YYYY-MM-DD",
  "reservation_time": "HH:MM:SS",
  "customer_name": "string",
  "customer_phone": "string",
  "memo": "string"
}
```
- Response 201: created row

## Reviews

GET `/api/reviews`
- Query
  - `storeId?: string`
  - `cursor?: string`
  - `limit?: number`
- Response
```json
{
  "items": [
    { "id": "uuid", "store_id": "uuid", "user_id": "uuid", "rating": 5, "content": "좋아요", "created_at": "..." }
  ],
  "nextCursor": null
}
```

## Favorites

GET `/api/favorites`
- Query: `userId?: string`, `storeId?: string`
- Response: favorite rows array

POST `/api/favorites`
- Body
```json
{ "user_id": "uuid", "store_id": "uuid" }
```
- Response 201: created row

DELETE `/api/favorites`
- Query (choose one)
  - `id=uuid`
  - or `userId=uuid&storeId=uuid`
- Response: `{ "ok": true }`

## Hooks (client)
- `useStores(params, { enabled })` — infinite query for stores
- `useStoreProducts({ storeId }, { enabled })`
- `useReviews({ storeId }, { enabled })`
- `useCreateReservation()` — POST
- `useFavorite(storeId, userId)` — `{ add, remove }`

## TODO
- Attach auth with RLS in cloud
- Expand filters (carrier, distance, price) per ERD
- Add write endpoints for reviews, store-products (seller scope)
