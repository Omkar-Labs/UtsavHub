import "dotenv/config";

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
