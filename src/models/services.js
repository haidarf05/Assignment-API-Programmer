const connectDB = require("../../config/db.connect");

async function ServicesCollection() {
  const db = await connectDB();
  return db.collection("services");
}

module.exports = ServicesCollection;
