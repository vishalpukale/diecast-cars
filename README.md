# DieCast Cars

Ecommerce storefront for diecast collectibles. Cart + WhatsApp checkout (no payment gateway yet). Built with the same microservice shape as the `release` project, stripped to essentials.

## Stack

- **Frontend:** React + Vite + Redux Persist + Tailwind
- **Backend:** `api-gateway` (3330) → `application-service` (3334)
- **DB:** PostgreSQL + Drizzle ORM

## DBeaver / Postgres credentials

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `diecast_cars` |
| Username | `diecast` |
| Password | `diecast_dev_2026` |
| Admin API key | `diecast_admin_dev_key` |

WhatsApp checkout number: `+91 76200 72536`

## Run locally

```bash
# 1) Backend deps + migrate + seed
cd backend
npm run install:all
cd application-service && npm run db:migrate && npm run db:seed && cd ..

# 2) Start API (gateway + application)
npm start

# 3) Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Store: http://localhost:5173  
- Admin: http://localhost:5173/admin  
- Gateway health: http://localhost:3330/health  
- App health: http://localhost:3334/api/health  

## Workflow

1. Browse catalog / product pages  
2. Add to cart (Redux + localStorage)  
3. Checkout with name, phone, address, city, pincode (notes optional)  
4. API creates `orders` + `order_items` (`pending_whatsapp`), decrements stock  
5. Opens WhatsApp with prefilled order message  

## Schema (lean, scalable)

`brands` → `categories` → `products` → `orders` / `order_items`  

Soft-delete + `is_active` + `meta` jsonb for future fields (variants, payments, users).
