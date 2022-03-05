require('dotenv').config();
const https = require('https')
const express = require('express');
const app = express();
const functions = require('./Functions')

functions.sortBounds()

functions.getContext()

functions.currentTime()

// WRITE OUT ON WHITEBOARD