const mongoose = require("mongoose");

const connectDatabase =() =>{
    mongoose.connect(process.env.DB_URI,{
        // userNewUrlParser:true,
        useUnifiedTopology:true,
        // userCreateIndex:true
    })
.then((data) =>{
    console.log(`MOngoDB connected with server: ${data.connection.host}`);
}).catch((err) =>{
    console.log(err);
});
};

module.exports = connectDatabase