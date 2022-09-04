require('dotenv').config();
const stops = {};
const context = {};
const time = {};
const info = {};
const legs = {};
const location = {};
const pathLat = [];
const pathLng = [];
const bounds = []

module.exports = { bounds, context, info, legs, location, stops, time, pathLat, pathLng }