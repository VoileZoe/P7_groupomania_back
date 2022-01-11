const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// retrieve all users from the database.
exports.findAll = (req, res) => {
  User.findAll()
    .then((users) => {
      // remove passwords for security
      users.map((u) => delete u.password);
      res.status(200).send(users);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// find a single user with an id
exports.findOne = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      // remove the password for security
      delete user.password;
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// update a user by id
exports.update = (req, res) => {
  (async () => {
    // get the user
    const user = await User.findById(req.params.id);

    // get the user info in the body
    const userObject = {};
    if (req.body.name) userObject.name = req.body.name;
    if (req.body.email) userObject.email = req.body.email;
    // if the password update requested, we hash it first
    if (req.body.password) {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(req.body.password, salt);
      userObject.password = hash;
    }

    // only the author and an admin can delete a thread
    if (user.id != req.body.user_id && user.role != "admin") {
      throw { status: 403, message: "Modification non autorisée" };
    }

    // update user in the database
    return User.update(req.params.id, userObject);
  })()
    .then((result) => {
      res.status(200).send({ message: result.message });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

// delete a user with the specified id
exports.delete = (req, res) => {
  (async () => {
    // get the user
    const user = await User.findById(req.params.id);

    // only the author and an admin can delete a thread
    if (user.id != req.body.user_id && user.role != "admin") {
      throw { status: 403, message: "Modification non autorisée" };
    }

    return User.delete(req.params.id);
  })()
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};
