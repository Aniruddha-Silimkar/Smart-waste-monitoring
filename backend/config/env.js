require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

function getRequiredEnv(name) {
  const value = process.env[name] && process.env[name].trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnv(name, fallback) {
  const value = process.env[name] && process.env[name].trim();
  return value || fallback;
}

function getProductionRequiredEnv(name, developmentFallback) {
  return isProduction ? getRequiredEnv(name) : getOptionalEnv(name, developmentFallback);
}

module.exports = {
  adminEmail: getOptionalEnv("ADMIN_EMAIL", "admin@gmail.com").toLowerCase(),
  adminName: getOptionalEnv("ADMIN_NAME", "Campus Admin"),
  adminPassword: getProductionRequiredEnv("ADMIN_PASSWORD", "admin123"),
  dnsServers: getOptionalEnv("DNS_SERVERS", "8.8.8.8,1.1.1.1")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean),
  jwtSecret: getProductionRequiredEnv("JWT_SECRET", "local_dev_jwt_secret"),
  modelApiUrl: getOptionalEnv("MODEL_API_URL", isProduction ? "https://smartwaste-python.onrender.com/predict" : "http://127.0.0.1:5001/predict"),
  mongoUri: getRequiredEnv("MONGO_URI"),
  port: getOptionalEnv("PORT", "5000"),
};
