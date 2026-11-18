import "dotenv/config";
import dns from "node:dns";
import os from "node:os";

// 1. Force Node.js DNS resolver to prioritize IPv4
dns.setDefaultResultOrder("ipv4first");

// 2. Mock dns.resolve6 to return ENODATA so Nodemailer's internal resolver never picks an IPv6 address
dns.resolve6 = (hostname, options, callback) => {
  const cb = typeof options === "function" ? options : callback;
  const err = new Error("queryAaaa ENODATA " + hostname);
  err.code = "ENODATA";
  if (typeof cb === "function") cb(err, []);
};
if (dns.Resolver && dns.Resolver.prototype) {
  dns.Resolver.prototype.resolve6 = function (hostname, callback) {
    const err = new Error("queryAaaa ENODATA " + hostname);
    err.code = "ENODATA";
    if (typeof callback === "function") callback(err, []);
  };
}

// 3. Filter out IPv6 interfaces before Nodemailer initializes
const originalNetworkInterfaces = os.networkInterfaces;
os.networkInterfaces = () => {
  const ifaces = originalNetworkInterfaces();
  const ipv4Only = {};
  for (const [name, list] of Object.entries(ifaces)) {
    if (list) {
      ipv4Only[name] = list.filter((item) => item.family === "IPv4" || item.family === 4);
    }
  }
  return ipv4Only;
};

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
