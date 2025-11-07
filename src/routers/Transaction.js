const Router = require("express").Router();
const TransacrionController = require("../controllers/Transaction");

Router.get("/balance", TransacrionController.balance);
Router.post("/topup", TransacrionController.topup);
Router.post("/transaction", TransacrionController.transaction);
Router.get("/transaction/history", TransacrionController.history);

module.exports = Router;
