const CryptoJS = require("crypto-js");

const { verifyToken } = require("../helpers/jwt");
// const User = require('../models/User');

const jwtAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      throw new Error("Token invalid");
    }
    const encryptedToken = token.split(" ")[1];

    const decoded = verifyToken(encryptedToken);
    req.decoded = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 101,
      message: "Token tidak valid atau kadaluwarsa",
      data: null,
    });
  }
};

module.exports = {
  jwtAuthenticate,
};
