const mongoose = require("mongoose");

const connectDatabase=()=>
{
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
         })
    .then((data)=>
    {
        console.log(`MongoDb connected with server ${data.connection.host}`)
    })
//     .catch((err)=>
//     {
//         console.log(err);
//         process.exit(1)
//     })
 }

module.exports = connectDatabase
