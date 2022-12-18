require('dotenv').config();
const https = require('https')
const express = require('express');
const app = express();
const functions = require('./Functions')

async function Context() {
    functions.getContext()

    functions.currentTime()

    functions.sortBounds()
}

Context();
// WRITE OUT ON WHITEBOARD