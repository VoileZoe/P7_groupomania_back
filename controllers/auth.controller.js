const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// create and save a new user
exports.signup = (req, res) => {
  console.info("--");
  console.info("controller.auth.signup");
  const password = req.body.password;
  if (!password) {
    console.warn("controller.auth.signup ko");
    console.warn("Mot de passe requis");
    return res.status(400).send({ message: "Mot de passe requis" });
  }
  bcrypt.genSalt().then((salt) => {
    bcrypt.hash(req.body.password, salt).then((hash) => {
      // create a user object
      const user = {
        name: req.body.name,
        email: req.body.email,
        password: hash,
      };

      // create user in the database
      User.create(user)
        .then((result) => {
          console.info("controller.auth.signup ok");
          res.status(200).send({ message: result.message });
        })
        .catch((err) => {
          console.warn("controller.auth.signup ko");
          console.warn(err);
          res.status(500).json({ message: err.message });
        });
    });
  });
};

exports.login = (req, res) => {
  console.info("--");
  console.info("controller.auth.login");
  // find the user in the database
  User.findByEmail(req.body.email)
    .then((user) => {
      if (user.status != "active") {
        console.info("controller.auth.login ko");
        return res.status(401).json({
          message:
            "Ce compte a été supprimé, contactez un admin pour le réactiver !",
        });
      }

      // compare the request password with the hash stored in the database
      bcrypt.compare(req.body.password, user.password).then((valid) => {
        // incorrect password
        if (!valid) {
          console.info("controller.auth.login ko");
          return res.status(401).json({ message: "Mot de passe incorrect !" });
        }
        // send the user id and a signed token
        console.info("controller.auth.login ok");
        res.status(200).json({
          userId: user.id,
          token: jwt.sign(
            { userId: user.id },
            process.env.RANDOM_TOKEN_SECRET,
            {
              expiresIn: "24h",
            }
          ),
          expiresIn: "24",
          role: user.role,
        });
      });
    })
    .catch((err) => {
      console.info("controller.auth.login ko");
      console.info(err);
      res.status(500).json(err);
    });
};
