const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: TOKEN_MAX_AGE_MS,
};

module.exports = { cookieOptions, TOKEN_MAX_AGE_MS };
