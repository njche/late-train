import dotenv from "dotenv"
import path from 'path'
import express from "express"
import cors from 'cors'
import { legs, location, context, info, stops, time } from './Variables.js'
import './Context.js'

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env')})
console.log(process.env.WEB_HOST)
const app = express();
const PORT = 8080;

app.listen(
    PORT,
    () => console.log(`PORT ${PORT} Active`)
)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.WEB_HOST); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods: GET')
    next();
});

app.get('/time', (req, res) => {
    res.status(200).send({
        data: time
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