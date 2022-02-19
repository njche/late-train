require('dotenv').config();
require('./Context')
const app = require('express')();
const { legs, location, context, info, stops, timeCET } = require('./Variables')
const functions = require('./Functions');
const PORT = 8080;

app.listen(
    PORT,
    () => console.log(`PORT ${PORT} Active`)
)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/time', (req, res) => {
    res.status(200).send({
        data: timeCET.now
    });
})

app.get('/info', (req, res) => {
    res.status(200).send({
        data: info.info
    })
})

app.get('/context', (req, res) => {
    res.status(200).send({
        data: context.payload
    })
})

app.get('/legs', (req, res) => {
    res.status(200).send({
        data: legs.product
    })
})

app.get('/stops', (req, res) => {
    res.status(200).send({
        data: stops.stops
    })
})

app.get('/location', (req, res) => {
    res.status(200).send({
        data: location
    })
})
