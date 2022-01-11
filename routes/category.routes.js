const express = require("express");
const categoryCtrl = require("../controllers/category.controller");

const router = express.Router();

router.get("/", categoryCtrl.findAll);

module.exports = router;
