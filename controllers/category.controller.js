const Category = require("../models/category.model");

// Retrieve all Categories from the database.
exports.findAll = (req, res) => {
  Category.findAll()
    .then((categorys) => {
      res.status(200).send(categorys);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while getting all categories.",
      });
    });
};
