const app =require("./app");
const dotenv = require("dotenv")
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database");


//Handling uncaught exception

process.on("uncaughtException", (err)=>
{
    console.log(`Error: ${err.message}`);
    console.log(`Uncaught Exception`)
    process.exit(1);
})

dotenv.config({path:"backend/config/config.env"});
console.log(process.env.C_NAME);
cloudinary.config({
    cloud_name: process.env.C_NAME,
    api_key: process.env.C_API_KEY,
    api_secret: process.env.C_API_SECRET,

});
connectDatabase();



const server = app.listen(process.env.PORT, ()=> {
    console.log(`Server is on http://localhost:${process.env.PORT}`);

});

//unhandled promise rejection
process.on("unhandledRejection",err =>
{
 console.log(`Error:${err.message}`);
 console.log(`Shutting down the server due to unhandled promise rejection`);
 server.close(()=>
 {
     process.exit(1);
 })
})

