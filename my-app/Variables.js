require('dotenv').config();
let stops = {};
let context = {};
let time = {};
let info = {};
let legs = {};
let location = {};
let pathLat = [];
let pathLng = [];
let bounds = [];

module.exports = { bounds, context, info, legs, location, stops, time, pathLat, pathLng }