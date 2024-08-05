const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(".env") });

const envSchema = Joi.object({
    PORT: Joi.number().integer().default(8001),
});

function getConfig() {
    try {
        return envSchema.validate(process.env);
    } catch (error) {
        throw new Error(`Config validation error: ${error}`);
    }
}

// const connectDB = async () => {
//     try {
//         const connectDB = await mongoose.connect(process.env.CONNECTION_STRING)
//     } catch (error) {

//     }
// }

module.exports = getConfig();