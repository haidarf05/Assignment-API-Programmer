require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./src/routers/index");
const PORT = process.env.PORT;
const app = express();

const server = require("http").Server(app);

require("./config/db.connect");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: "PHP 7.4.11" }));
app.use(cors());

app.use("/", router);
app.use("/profileImage", express.static("./profile_image"));

server.listen(PORT, () => {
  console.log(`Current PORT: ${PORT}`);
});
