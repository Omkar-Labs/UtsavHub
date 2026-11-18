import "dotenv/config";
import dns from "node:dns";

// Force Node.js DNS resolver to prioritize IPv4 over IPv6
// Prevents ENETUNREACH errors on cloud hosting (e.g., Render) without IPv6 routes
dns.setDefaultResultOrder("ipv4first");

import dbConnect from "./Db/dbConnect.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 5000;

// Connect to Database first, then listen on PORT
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize server:", err.message);
  });
