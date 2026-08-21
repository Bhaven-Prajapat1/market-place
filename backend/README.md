# Market-Place Backend — Overview

This file summarizes the backend services in this repository, how to run them locally or via Docker, where to find routes/tests, and notes for building the frontend.

## Project layout

- `ai-buddy/` — AI assistant + socket server (realtime agent). Entry: [ai-buddy/server.js](ai-buddy/server.js)
- `auth/` — Authentication and user/address management. Entry: [auth/server.js](auth/server.js)
- `cart/` — Shopping cart service. Entry: [cart/server.js](cart/server.js)
- `notification/` — Email/notification service. Entry: [notification/server.js](notification/server.js)
- `order/` — Order creation / management. Entry: [order/server.js](order/server.js)
- `payment/` — Payment integration service. Entry: [payment/server.js](payment/server.js)
- `product/` — Product catalog, cache, validators. Entry: [product/server.js](product/server.js)
- `seller-dashboard/` — Seller admin APIs. Entry: [seller-dashboard/server.js](seller-dashboard/server.js)

Each service is a small Node.js app with its own `package.json`, `dockerfile`, and (in many cases) a `jest.config.js` for tests.

## How to run a service locally

1. Open a terminal in the service folder, for example:

   cd backend/auth

2. Install dependencies and start:

   npm install
   npm start

If a `start` script is not present, run:

   node server.js

Environment variables: each service has an optional `.env` file in its folder. Inspect the `.env` files in each service for required variables.

## Docker (build & run)

Build a service image from the repository root:

   docker build -t market-<service> -f backend/<service>/dockerfile backend/<service>

Run (example):

   docker run -e "PORT=3000" -p 3000:3000 market-<service>

Replace `<service>` with `auth`, `product`, etc.

## Tests

- Services with tests include `auth`, `cart`, `order`, `product`, and others. Look at each service's `tests/` or `test/` folder (for example `auth/tests/`). Run tests with:

   npm test

If services use Jest, `jest.config.js` will be present in the service root.

## Where to find API endpoints (for frontend design)

- The canonical source of HTTP endpoints is the `src/routes` folders inside each service. For example: [auth/src/](auth/src/)
- Automated tests provide example calls and expected payloads — check the `tests/` and `test/` directories (e.g., `auth/tests` and `product/tests`) for request/response samples.

Hints to discover routes quickly:
- Open `backend/<service>/src/routes` to list endpoints.
- Open `backend/<service>/server.js` or `backend/<service>/src/app.js` to see the mounted route prefixes and middleware.
- Use tests as a reference for request bodies and response shapes.

## Realtime & inter-service patterns

- Several services contain a `broker/` folder — these are used for internal pub/sub/event-driven communication between services.
- `ai-buddy` contains a socket server under `ai-buddy/src/socket/socket.server.js` for realtime chat/agent interactions.

## Quick API examples (templates)

Authentication (example):

  POST /auth/register
  Content-Type: application/json
  Body: { "email": "user@example.com", "password": "..." }

  POST /auth/login
  Content-Type: application/json
  Body: { "email": "user@example.com", "password": "..." }

Products (example):

  GET /products
  GET /products/:id

Cart (example):

  GET /cart
  POST /cart/items
  PATCH /cart/items/:itemId

Orders / Checkout (example):

  POST /orders
  GET /orders/:id

Note: exact paths and payloads are defined in each service's `routes` folder and in the tests — use them to generate concrete API contracts.

## Notes for the frontend designer (Claude / UX)

- Start by implementing flows: sign-up/login, product listing, product details, add-to-cart, cart review, checkout (order creation + payment), order history, and seller dashboard.
- Use the `tests/` folders as mocks when building UI prototypes; they often include sample responses and validation rules.
- For realtime chat or help widgets, integrate with `ai-buddy` socket server (inspect `ai-buddy/src/socket/socket.server.js`).
- Authentication tokens and session handling are implemented server-side — inspect `auth` to confirm token type and header names.

## Useful files / entry points

- [ai-buddy/server.js](ai-buddy/server.js)
- [auth/server.js](auth/server.js)
- [cart/server.js](cart/server.js)
- [notification/server.js](notification/server.js)
- [order/server.js](order/server.js)
- [payment/server.js](payment/server.js)
- [product/server.js](product/server.js)
- [seller-dashboard/server.js](seller-dashboard/server.js)

## Next steps (suggested)

- Run each service locally and use a tool like Postman to record example responses.
- Generate an OpenAPI/Swagger contract for each service (optional) to make frontend integration with Claude precise.

If you want, I can:
- produce a per-service endpoint list by scanning `src/routes` and tests, or
- generate an OpenAPI spec skeleton for the endpoints you care about.

---
Generated on: 2026-08-12
