const express = require('express')
const dbConnection = require('./config/db')
const cookieParser = require('cookie-parser');
const Config = require('./config')
const authRoutes = require('./routes/authRoutes')
const messageRoutes = require('./routes/messageRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

const PORT = Config.PORT || 5000;

// dbConnection
dbConnection()

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
   
    next();
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages',messageRoutes)
app.use('/api', userRoutes);

app.listen(PORT, (err) => {
    if (err) {
        console.log(err, 'server is not Connected')
    }
    console.log(`listening on port : http://localhost:${PORT}`)
})