const ContentType = require("../models/contentType.model");

// Retrieve all Categories from the database.
exports.findAll = (req, res) => {
  ContentType.findAll()
    .then((contentTypes) => {
      res.status(200).send(contentTypes);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while getting all categories.",
      });
    });
};
