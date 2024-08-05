const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.resolve(".env") });

const envSchema = Joi.object({
    PORT: Joi.number().integer().default(5001),
});

function getConfig() {
    try {
        return envSchema.validate(process.env);
    } catch (error) {
        throw new Error(`Config validation error: ${error}`);
    }
}

module.exports = getConfig();