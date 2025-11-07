const connectDB = require("../../config/db.connect");

async function UserCollection() {
  const db = await connectDB();
  return db.collection("users");
}

module.exports = UserCollection;
