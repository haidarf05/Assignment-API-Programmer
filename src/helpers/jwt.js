const jwt = require("jsonwebtoken");

function generateTokenWithExp(payload) {
  return jwt.sign(payload, process.env.SECRET, {
    expiresIn: "12 hours",
  });
}
function generateTokenWOExp(payload) {
  return jwt.sign(payload, process.env.SECRET);
}

function verifyToken(token) {
  return jwt.verify(token, process.env.SECRET);
}

module.exports = {
  generateTokenWOExp,
  generateTokenWithExp,
  verifyToken,
};
