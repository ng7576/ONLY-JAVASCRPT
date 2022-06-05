 const express = require("express");
 const app = express();
 const cookieParser = require("cookie-parser");
 const bodyParser = require("body-parser");
 const fileUpload = require("express-fileupload");

// improrting middleware for error handling
 const errorMiddleware = require("./MIDDLEWARE/error")


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

//importing routes
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");


app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order); 


app.use(errorMiddleware);


 module.exports = app