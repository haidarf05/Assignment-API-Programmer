const Router = require("express").Router();
const UserController = require("../controllers/Membership");
const validateEmail = require("../middlewares/validateEmail");
const { jwtAuthenticate } = require("../middlewares/auth");
const { uploadMiddleware } = require("../middlewares/uploadImage");

Router.post(
  "/registration",
  validateEmail("register"),
  UserController.registration
);
Router.post("/login", validateEmail("login"), UserController.login);
Router.get("/profile", jwtAuthenticate, UserController.profile);
Router.put("/profile/update", jwtAuthenticate, UserController.update);
Router.put(
  "/profile/image",
  jwtAuthenticate,
  uploadMiddleware,
  UserController.image
);

module.exports = Router;
