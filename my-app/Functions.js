require('dotenv').config();
const https = require('https')
const express = require('express');
const { bounds, context, info, legs, location, stops, timeCET, pathLat, pathLng, api_key } = require('./Variables');

// Queries the soonest available trip that has not departed yet

getContext = () => {
    const contextOptions = {
        hostname: 'gateway.apiportal.ns.nl',
        port: 443,
        path: '/reisinformatie-api/api/v3/trips?lang=eng&fromStation=ehv&toStation=ut&originWalk=false&originBike=false&originCar=false&destinationWalk=false&destinationBike=false&destinationCar=false&shorterChange=false&travelAssistance=false&searchForAccessibleTrip=false&localTrainsOnly=false&excludeHighSpeedTrains=false&excludeTrainsWithReservationRequired=false&yearCard=false&discount=NO_DISCOUNT&travelClass=2&passing=false&travelRequestType=DEFAULT',
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.API_KEY
        }
    }
    
    const req = https.get(contextOptions, res => {
        console.log('Getting trip');
        
        // Make data JSON compatible
        let str = '';
        res.on('data', d => {
            str += d;
        });
        
        // grabs context for next trip    
       
        res.on('end', () => {
            const data = JSON.parse(str)
            if (data.trips[0].legs.length > 1) {
                context.payload = data.trips[1].ctxRecon
            } else {
                context.payload = data.trips[0].ctxRecon
            }  
            
            
            // triggers next query function
            
            getTrip(context.payload)
        })
        
        req.on('error', error => {
            console.error(error)
        })
    })
}

function getTrip(query) { 
    const options = {
        hostname: 'gateway.apiportal.ns.nl',
        port: 443,
        path: `/reisinformatie-api/api/v3/trips/trip?ctxRecon=${query}`,
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.API_KEY
        }
    }

    const req = https.get(options, res => {
        console.log('Getting product');        
        // Make data JSON compatible
        let str = '';
        res.on('data', d => {
            str += d;
        });
        
        res.on('end', () => {
            const data = JSON.parse(str)
            
            // storing relevant data to objects

            // all info
            info.info = data
            
            // train number
            legs.product = parseInt(data.legs[data.legs.length - 1].product.number)

            // route stops
            stops.stops = data.legs[data.legs.length - 1].stops

            // triggers function to get GPS coordinates of active train
            return getLocation();
        })
        req.on('error', error => {
            console.error(error)
        })    
    })

}

// Grabs all current active trains, then interrates through and gives us location of the train for our trip
getLocation = () => {
    const options = {
        hostname: 'gateway.apiportal.ns.nl',
        port: 443,
        path: '/virtual-train-api/api/vehicle',
        method: 'GET',
        headers: {
            'Ocp-Apim-Subscription-Key': process.env.API_KEY
        }
    }

    const req = https.get(options, res => {

        // Make data JSON compatible
        let str = '';
        res.on('data', d => {
            str += d;
        });

        // Parse compatible JSON data
        res.on('end', () => {
            const trains = JSON.parse(str)

            // Grabs lat, lng. Adds to location Object
            for (i = 0; i < trains.payload.treinen.length; i++) {
                if (trains.payload.treinen[i].treinNummer === legs.product) {
                    location.lat = trains.payload.treinen[i].lat
                    location.lng = trains.payload.treinen[i].lng
                    break
                }
            }

            // logic wether GPS is active or has not departed
            if (location.lat === undefined) {
                location.status = 'Waiting for departure'
            } else {
                location.status = 'Active'
            }

            // logic to determine wether or not train is at destination
            if (location.lat <= pathLat[pathLat.length - 1] && location.lat >= pathLat[0]) {
                if (location.lng <= pathLng[pathLng.length - 1] && location.lng >= pathLng[0]) {
                    location.status = 'Arrived';
                }
            }
            

            console.log('Location of product: ' + legs.product, location)
            // checks whether the train has reach destination. If it has it will automatically restart the process for the next trip, otherwise it will update GPS coordinates
            return checkStatus(location.status)
        })

        req.end()
        
    })

    req.on('error', error => {
        console.error(error)
    })
}

const checkStatus = (status) => {
    if (status !== 'Arrived') {
        setTimeout(getLocation, 3000)
    } else {
        setTimeout(getContext, 6000)
    }
}

function sortBounds() {
    for (let i = 0; i < bounds.length; i++) {
        pathLat.push(bounds[i].lat);
        pathLng.push(bounds[i].lng);
    }
    pathLat.sort((a, b) => {
        return a - b
    })
    pathLng.sort((a, b) => {
        return a + b
    })
}

function currentTime() {
    let date = new Date(); 
    let hh = date.getUTCHours() + 1;
    let mm = date.getUTCMinutes();
    let ss = date.getUTCSeconds();
    let session = "CET"
    
    hh = (hh > 23) ? h = "0" : hh;
    hh = (hh < 10) ? "0" + hh : hh;
    mm = (mm < 10) ? "0" + mm : mm;
    ss = (ss < 10) ? "0" + ss : ss;
      
    timeCET.now = hh + ":" + mm + ":" + ss + " " + session;
    
    let t = setTimeout(function(){ currentTime() }, 1000);
}
  



module.exports = { getContext, sortBounds, currentTime }