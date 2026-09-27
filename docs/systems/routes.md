# Routes

**Routes** (`31-routes.js`: demand, fares and the dispatcher, with the world map; the tables they read, such as `TIERBASE`, `RFARE` and `SEA_MUL`, stay in `03-state.js`).
- Each city has a market in seats per day (`cityMarket`, which includes Lowmere's cut through `rivKeep`).
- `routeLF` gives how full a flight will be.
- The dispatcher `pickRoute` sends each plane where it earns most per hour.
- Fares are −20%, standard or +25% per route.
