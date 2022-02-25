const app = require("./app");

const dotenv = require("dotenv");
const { listeners } = require("./app");

const connectDatabase = require("./config/database");

//handling uncaught exceptions
process.on("uncaughtException",(err) =>{
    console.log(`Error:${err.message}`);
    console.log(`Shutting down the server due to uncaught exceptions`);
    process.exit(1);
})

//config
dotenv.config({path:"backend/config/config.env"});

//connecting to db
connectDatabase();



const server = app.listen(process.env.PORT,() => {
    console.log(`Server is workig on http://localhost:${process.env.PORT}`)
    // debug("Running on port", listener.address().PORT);
})

// console.log(youtube);
//unhandled Promise Rejection
process.on("unhandledRejection",err =>{
    console.log(`Error: ${err.messgae}`);
    console.log(`Shutting down the server due to unhandled Promise Rejection`);

    server.close(() =>{
        process.exit(1);
    });
});