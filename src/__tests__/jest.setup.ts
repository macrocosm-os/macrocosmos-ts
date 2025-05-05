import "@jest/globals";
import { config } from "dotenv";

// Load environment variables from .env file
config();

console.log("Environment variables loaded from .env file");
console.log("api key:", process.env.MACROCOSMOS_API_KEY);
