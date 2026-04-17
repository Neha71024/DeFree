const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function getToken() {
     // Just generate a token for user ID "661f4faebdd2348512341234" (fake)
     const token = jwt.sign({ userId: "661f4faebdd2348512341234" }, process.env.JWT_SECRET, { expiresIn: '1h' });
     console.log(token);
}
getToken();
