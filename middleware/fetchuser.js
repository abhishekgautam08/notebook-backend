const jwt = require("jsonwebtoken");
const JWT__SECRET = "AbhshekisGoodB@oy";

const fetchuser = (req, res, next) => {
  // Get the User from the jwt token and add id to req object

  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
  try {
    const data = jwt.verify(token, JWT__SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.send(401);
  }
};

module.exports = fetchuser;
