require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const sureveyRoutes = require('./routers/survayRoutes');
const bodyParser = require('body-parser');
const userRouter = require('./routers/userRoutes');
const cookieParser = require('cookie-parser');
const port = process.env.PORT;
const database = process.env.DATABASE;
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorHandler');
var cors = require('cors');


app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(bodyParser.json({ type: 'application/*+json' }));


mongoose.connect(database, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(data => (console.log('connected to database')))
    .catch(err => console.log(err));



app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'testing success'
    });
});
app.use('/api/user', userRouter);
app.use('/api/surveys', sureveyRoutes);
app.get('*', (req, res, next) => {
    next(new AppError('cant find Url', 404));
});

app.use(globalErrorHandler);
const server = app.listen(port, () => (console.log(`listen on port  ${port}`)));
process.on('unHandledRejection', err => {
    console.log('Unhandled Rejection');
    console.log(err.name + " message " + err.message + err.stack);
    server.close(() => {
        process.exit(1);
    });
});

