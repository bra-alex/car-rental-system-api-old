export default {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  saltFactor: process.env.SALT_FACTOR,
  accessTokenTTL: process.env.ACCESS_TOKEN_TTL,
  refreshTokenTTL: process.env.REFRESH_TOKEN_TTL,
  accessTokenPrivateKey: process.env.ACCESS_TOKEN_PRIVATE_KEY,
  accessTokenPublicKey: process.env.ACCESS_TOKEN_PUBLIC_KEY,
}
