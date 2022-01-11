const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.info("--");
  console.info("middleware.auth.authenticate");
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "Invalid user ID";
    } else {
      console.info("middleware.auth.authenticate ok");
      next();
    }
  } catch {
    console.info("middleware.auth.authenticate ko");
    res.status(401).send({
      message: "Autentification invalide",
    });
  }
};
