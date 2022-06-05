const mongoose = require('mongoose');

const connectDB = async() =>
{
    try
    {
        await mongoose.connect(process.env.DB_LINK);
        console.log("\x1b[36m", `Mongo connection established successfully`, "\x1b[37m");
    }
    catch(e)
    {
        console.log('\x1b[31m', `Error: ${e}`, "\x1b[37m");
        process.exit();
    }
}

module.exports = connectDB;