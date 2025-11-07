const Router = require("express").Router();
const InformationController = require("../controllers/Information");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.get("/banner", InformationController.banner);
Router.get("/services", jwtAuthenticate, InformationController.services);

module.exports = Router;
