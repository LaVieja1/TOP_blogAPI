const Author = require("../models/author");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

exports.signup = [
  body("username", "Nombre vacio")
    .trim()
    .escape()
    .custom(async (username) => {
      try {
        const existingUsername = await Author.findOne({ username: username });
        if (existingUsername) {
          throw new Error("nombre de usuario ya esta en uso.");
        }
      } catch (err) {
        throw new Error(err);
      }
    }),
  body("password").isLength(6).withMessage("Minimo 6 caracteres"),
  body("confirm-password").custom((value, { req }) => {
    if (value !== req.body.password) {
      return next("Las contraseñas no son iguales");
    }
    // Indicates the success of this synchronous custom validator
    return true;
  }),
  async (req, res, next) => {
    const errors = validationResult(req);
    passport.authenticate("signup", { session: false }, (err, user, info) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json({
          username: req.body.username,
          errors: errors.array(),
        });
      }
      if (err) {
        return next(err);
      }
      res.json({
        message: "Registro exitoso",
        user: req.user,
      });
    })(req, res, next);
  },
];

exports.login = async (req, res, next) => {
  passport.authenticate("login", async (err, user, info) => {
    try {
      if (err || !user) {
        const error = new Error("Ocurrio un error.");

        return next(error);
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = { _id: user._id, username: user.username };
        const token = jwt.sign({ user: body }, process.env.SECRET, {
          expiresIn: "1d",
        });

        return res.json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect("/");
};