const mongoose = require('mongoose')
const Config = require('.')

const url = Config.DB_URL

const dbConnection = async () => {
    try {
        await mongoose.connect(url);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error("Database Connection Error:", error);
    }
}

module.exports = dbConnection