require('dotenv').config();
const https = require('https')
const express = require('express');
const app = express();
const functions = require('./Functions')

functions.currentTime()

functions.sortBounds()

functions.getContext()


// WRITE OUT ON WHITEBOARD