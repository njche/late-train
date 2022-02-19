require('dotenv').config();
const https = require('https')
const express = require('express');
const app = express();
const functions = require('./Functions')
const { bounds, context, info, legs, location, stops, timeCET } = require('./Variables');

functions.sortBounds()

functions.getContext()

functions.currentTime()

// WRITE OUT ON WHITEBOARD