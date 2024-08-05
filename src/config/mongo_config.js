const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectDB = await mongoose.connect(
            process.env.CONNECTION_STRING,
            {
                dbName: "wallet-db"
            }
        );
        console.log('- DB Connected to database: ', connectDB.connection.name);
    } catch (error) {
        console.error('- Connect DB Error: ', error);
        process.exit(1);
    }
}

module.exports = connectDB