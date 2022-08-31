require('dotenv').config();
const https = require('https')
const express = require('express');
const { bounds, context, info, legs, location, stops, time, pathLat, pathLng } = require('./Variables');
let deadline;
let count = 0
let x = 0;
// Queries the soonest available trip that has not departed yet

getContext = () => {
    const contextOptions = {
        hostname: 'gateway.apiportal.ns.nl',
        port: 443,
        path: '/reisinformatie-api/api/v3/trips?lang=eng&fromStation=apd&toStation=ww&originWalk=false&originBike=false&originCar=false&destinationWalk=false&destinationBike=false&destinationCar=false&shorterChange=false&travelAssistance=false&searchForAccessibleTrip=false&localTrainsOnly=false&excludeHighSpeedTrains=false&excludeTrainsWithReservationRequired=false&yearCard=false&discount=NO_DISCOUNT&travelClass=2&passing=false&travelRequestType=DEFAULT',
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

            location.late = false;
            
            if (x === 6) {
                x = 0;
                return getContext();
            }
            
            if (!data.trips) {
                location.status = 'No trip found';
                console.log('No trip found');
                console.log(location);
                x += 1;
                return getContext();
            }
            
            if (!data.trips[x].legs[0]) {
                location.status = 'No legs found';
                console.log('No legs found');
                console.log(location);
                x += 1;
                return getContext();
            }
            
            if (data.trips[x].legs[0].product.shortCategoryName === 'BUS') {
                location.status = 'Waiting for departure';
                x += 1;
                console.log('Trip #', x);
                return getContext();
            }

            if (data.trips[x].status === 'ALTERNATIVE_TRANSPORT') {
                location.status = 'Waiting for departure';
                x += 1;
                console.log('Trip #', x);
                return getContext();
            }

            console.log(data.trips[x].legs[0].destination.name);
            context.payload = data.trips[x].ctxRecon;
            
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
            info.info = data;

            let startDay = Number(info.info.legs[0].origin.plannedDateTime.slice(8,10));
            console.log(startDay)

            // let startMonth = Number(info.info.legs[0].origin.plannedDateTime.slice(5,7));
            // let deadlineDay = Number(info.info.legs[0].destination.plannedDateTime.slice(8,10));
            // let deadlineMonth = Number(info.info.legs[0].destination.plannedDateTime.slice(5,7));


            // these if statements prevent using trips that already active, thus giving us time to vote.
            
            if (Number(time.now.slice(0,2)) > Number(info.info.legs[0].origin.plannedDateTime.slice(11,13))) {
                if (time.day === startDay) {
                    x += 1;
                    console.log(x, 'first')
                    console.log(info)
                    return getContext()
                }
            }

            if (Number(time.now.slice(0,2)) === Number(info.info.legs[0].origin.plannedDateTime.slice(11,13))) {
                if (time.day === startDay) {
                    if (Number(time.now.slice(3,5)) > Number(info.info.legs[0].origin.plannedDateTime.slice(14,16))) {
                        x += 1;
                        console.log(x, 'second')
                        console.log(info)
                        return getContext()
                    }
                }
            }
            
            // train number
            data.legs.length !== undefined ? legs.product = parseInt(data.legs[0].product.number) : getContext();

            // route stops
            stops.stops = data.legs[0].stops;

            // reset count
            x = 0;

            // triggers function to get GPS coordinates of active train
            return getLocation();
        })
        req.on('error', error => {
            console.error(error);
        })    
    })

}

function duration() {
    let startDay = Number(info.info.legs[0].origin.plannedDateTime.slice(8,10));
    let mmDuration = info.info.legs[0].origin.plannedDateTime.slice(14,16);
    let ssDuration = info.info.legs[0].origin.plannedDateTime.slice(17,19);
    let deadlineHour = Number(info.info.legs[0].destination.plannedDateTime.slice(11,13));
    let deadlineMinute = Number(info.info.legs[0].destination.plannedDateTime.slice(14,16));
    let minutesBeforeDeadline = Number(time.now.slice(0, 2) * 100) + Number(time.now.slice(3, 5));

    time.startTime = info.info.legs[0].origin.plannedDateTime.slice(11,19);
    time.durationHours = count;
    time.durationMinutes = Number(time.now.slice(3,5)) - Number(mmDuration);
    time.durationSeconds = Number(time.now.slice(6,8)) - ssDuration;

    time.durationMinutes < 0 ? time.durationMinutes += 60 : time.durationMinutes

    if (time.durationMinutes === 0) {
        if (time.durationSeconds === 0) {
            if (time.now === time.startTime) {
                count = 0;
            } else {
                count++;
            }
        }
    }

    deadline = ((deadlineHour * 100) + deadlineMinute);

    if (minutesBeforeDeadline > deadline) {
        if (time.day === startDay) {
            location.late = true;
        } else {
            location.late = false;
        }
    }
}

// Grabs all current active trains, then iterates through and gives us location of the train for our trip
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
            const trains = JSON.parse(str);
            let h = Number(time.now.slice(0,2));
            let m = Number(time.now.slice(3,5));
            let startDay = Number(info.info.legs[0].origin.plannedDateTime.slice(8,10));
            let dHours = Number(info.info.legs[0].origin.plannedDateTime.slice(11,13));
            let dMinutes = Number(info.info.legs[0].origin.plannedDateTime.slice(14,16));

            // Grabs lat, lng. Adds to location Object
            for (i = 0; i < trains.payload.treinen.length; i++) {
                if (trains.payload.treinen[i].treinNummer === legs.product) {
                    location.lat = trains.payload.treinen[i].lat;
                    location.lng = trains.payload.treinen[i].lng;
                    break;
                }
            }

            // changes status wether if clock is equal to trips planned departure time or not

            if (time.day === startDay) {
                h - dHours > 0 ? location.status = 'Active' :
                h - dHours === 0 ? m - dMinutes >= 0 ? location.status = 'Active' :
                location.status = 'Waiting for departure' :
                location.status = 'Waiting for departure'
            }

            if (time.day < startDay) {
                location.status = 'Waiting for departure'
            }

            // logic wether GPS is active or has not departed. If no GPS location, we call the initial getContext Function
            
            if (location.status === 'Active') {
                if (typeof location.lat == 'undefined') {
                    console.log('No GPS coordinates')
                    x += 1;
                    return getContext();
                }
            }

            // logic to determine wether or not train is at destination
            if (location.lat <= pathLat[pathLat.length - 1] && location.lat >= pathLat[0]) {
                if (location.lng <= pathLng[pathLng.length - 1] && location.lng >= pathLng[0]) {
                    location.status = 'Arrived';
                }
            }
            

            console.log('Location of product: ' + legs.product, location);
            // checks whether the train has reach destination. If it has it will automatically restart the process for the next trip, otherwise it will update GPS coordinates
            return checkStatus(location);
        })

        req.end()
        
    })

    req.on('error', error => {
        console.error(error);
    })
}

const checkStatus = (location) => {

    if (location.late === true) {
        location.status = 'Late'
        location.late = false
        return setTimeout(getContext, 6000)
    }

    if (location.status !== 'Arrived') {
        return setTimeout(getLocation, 3000)
    }
    return setTimeout(getContext, 6000)
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
    let dd = date.getUTCDate();
    let hh = date.getUTCHours() + 2;
    let mm = date.getUTCMinutes();
    let ss = date.getUTCSeconds();
    
    dd = (date.getUTCHours() > 21) ? dd = dd + 1 : dd;
    hh = (hh > 23) ? h = "0" : hh;
    hh = (hh < 10) ? "0" + hh : hh;
    mm = (mm < 10) ? "0" + mm : mm;
    ss = (ss < 10) ? "0" + ss : ss;
    
    time.now = hh + ":" + mm + ":" + ss;

    time.day = dd;

    console.log(time);
    
    info.info !== undefined ? duration(count)
    : console.log("info undefined")
    
    setTimeout(function(){ currentTime() }, 1000);
}

module.exports = { getContext, sortBounds, currentTime }