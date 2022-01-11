const ContentStatus = require("../models/contentStatus.model");

// Retrieve all Categories from the database.
exports.findAll = (req, res) => {
  ContentStatus.findAll()
    .then((contentStatus) => {
      res.status(200).send(contentStatus);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while getting all status.",
      });
    });
};
