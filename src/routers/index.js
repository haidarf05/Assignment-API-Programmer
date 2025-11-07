const express = require("express");
const Router = express.Router();
const UserRouter = require("./Membership");
const InformationRouter = require("./Information");
const TransactionRouter = require("./Transaction");

const { jwtAuthenticate } = require("../middlewares/auth");

Router.use("/membership", UserRouter);
Router.use("/information", InformationRouter);
Router.use("/transaction", jwtAuthenticate, TransactionRouter);

Router.get("/", (req, res) => {
  res.send("Server is running");
});
module.exports = Router;
