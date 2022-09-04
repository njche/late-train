require('dotenv').config();
const https = require('https')
const express = require('express');
const app = express();
const functions = require('./Functions')

functions.currentTime()

functions.getContext()

functions.sortBounds()

// WRITE OUT ON WHITEBOARD