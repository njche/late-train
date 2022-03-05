require('dotenv').config();
const stops = {};
const context = {};
const time = {};
const info = {};
const legs = {};
const location = {};
const pathLat = [];
const pathLng = [];
const bounds = [
    {
        "lat": 52.0892900756836,
        "lng": 5.1082776527404805
    },
    {
        "lat": 52.087690075683604,
        "lng": 5.109777652740481
    },
    {
        "lat": 52.0900900756836,
        "lng": 5.11077765274048
    },
    {
        "lat": 52.0885400756836,
        "lng": 5.11227765274048
    }
]

module.exports = { bounds, context, info, legs, location, stops, time, pathLat, pathLng }