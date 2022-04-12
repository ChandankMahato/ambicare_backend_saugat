const express = require('express');
require("express-async-errors");
const env = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const users = require('./routes/users');
const drivers = require('./routes/drivers');
const requests = require("./routes/requests");
const ambulances = require("./routes/ambulances");
const ambulanceServices = require("./routes/ambulanceServices");
const error = require("./middleware/error");
const otp = require("./routes/otp")

const app = express();
env.config();

// mongodb+srv://admin:<password>@cluster0.da22l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
mongoose.connect(
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.da22l.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true,
    }
).then(()=>{
    console.log('Database connected');
}).catch(ex => {
    console.log("Couldnot connect to mongodb");
});

//routes
app.use(cors());
app.use(express.json());
app.use('/api/user/', users);
app.use('/api/driver', drivers);
app.use("/api/request", requests);
app.use("/api/ambulance", ambulances);
app.use("/api/service", ambulanceServices);
app.use("/api/otp", otp);
app.use(error);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})