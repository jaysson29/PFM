import arcjet, { tokenBucket } from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"], // Track based on clerk user ID
  rules: [
    tokenBucket({
      mode: "LIVE", // Enforce rate limiting in live mode
      refillRate: 10, // 10 tokens per interval
      interval: 3600, // 1 hour
      capacity: 10, // 10 requests
    }),
  ],
});

export default aj;
