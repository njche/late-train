import * as https from 'https'
import dotenv from "dotenv"
import path from 'path'
import { context, info, legs, location, stops, time } from './Variables.js'

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env')})

let deadline;
let bounds = [];
let pathLat = [];
let pathLng = [];
let count = 0;
let x = 0;

// Queries the soonest available trip that has not departed yet

export const getContext = () => {
    const contextOptions = {
        hostname: 'gateway.apiportal.ns.nl',
        port: 443,
        path: '/reisinformatie-api/api/v3/trips?lang=eng&fromStation=asd&toStation=ut&originWalk=false&originBike=false&originCar=false&destinationWalk=false&destinationBike=false&destinationCar=false&shorterChange=false&travelAssistance=false&searchForAccessibleTrip=false&localTrainsOnly=false&excludeHighSpeedTrains=false&excludeTrainsWithReservationRequired=false&yearCard=false&discount=NO_DISCOUNT&travelClass=2&passing=false&travelRequestType=DEFAULT',
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

            location.status = 'Waiting on departure';
            location.late = false;
            if (x === 6) {
                location.lat = undefined;
                location.lng = undefined;
                stops.stops = undefined;
                bounds = [];
                pathLat = [];
                pathLng = [];
                context.payload = undefined;
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
            
            if (data.trips[x].legs[0].product.type !== 'TRAIN') {
                location.status = 'Waiting for departure';
                x += 1;
                console.log('Trip #', x);
                return getContext();
            }

            console.log(data.trips[x].legs[0].destination.name);
            context.payload = data.trips[x].ctxRecon;
            
            // triggers next query function            
            getTrip(context.payload);
        })
        
        req.on('error', error => {
            console.error(error)
        })
    })
}

export function sortBounds() {
    for (let i = 0; i < bounds.length; i++) {
        pathLat.push(bounds[i].lat);
        pathLng.push(bounds[i].lng);
    }
    pathLat.sort((a, b) => {
        return a - b
    })
    pathLng.sort((a, b) => {
        return a - b
    })
    bounds.length = 0;
}

function getTrip(query) { 

    console.log(query);

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
            if (typeof data.legs == 'undefined') {
                console.log('legs undefined')
                x += 1;
                return getContext();
            }
            
            legs.product = parseInt(data.legs[0].product.number);

            // all info
            info.info = data;

            // Trip destination
            let endPoint = info.info.legs[info.info.legs.length - 1].destination;

            // Day that the trip begins
            let startDay = Number(info.info.legs[0].origin.plannedDateTime.slice(8,10));

            // these if statements prevent using trips that already active, thus giving us time to vote.
            if (Number(time.now.slice(0,2)) > Number(info.info.legs[0].origin.plannedDateTime.slice(11,13))) {
                if (time.day === startDay) {
                    x += 1;
                    console.log(x, 'LINE 126');
                    delete context.payload;
                    return getContext()
                }
            }

            if (Number(time.now.slice(0,2)) === Number(info.info.legs[0].origin.plannedDateTime.slice(11,13))) {
                if (time.day === startDay) {
                    if (Number(time.now.slice(3,5)) > Number(info.info.legs[0].origin.plannedDateTime.slice(14,16))) {
                        x += 1;
                        console.log(x, 'LINE 136');
                        return getContext()
                    }
                }
            }

            // Defines the finish lines of trip
            bounds.push({ lat: endPoint.lat - 0.0024, lng: endPoint.lng - 0.001 });
            bounds.push({ lat: endPoint.lat + 0.0008, lng: endPoint.lng - 0.004 });
            bounds.push({ lat: endPoint.lat + 0.0024, lng: endPoint.lng + 0.001 });
            bounds.push({ lat: endPoint.lat - 0.0007, lng: endPoint.lng + 0.004 });
            
            // sorts finish line boundary coordinates to help verify train has arrived
            sortBounds();
            console.log(pathLat);
            console.log(pathLng);
            


            // train number
            if (info.info.legs[0].origin.actualDateTime) {
                legs.startDate = new Date(info.info.legs[0].origin.actualDateTime);
                legs.arrivalDate = new Date(info.info.legs[0].destination.actualDateTime);
            } else {
                legs.startDate = new Date(info.info.legs[0].origin.plannedDateTime);
                legs.arrivalDate = new Date(info.info.legs[0].destination.plannedDateTime);
            }
            

            // route stops
            stops.stops = data.legs[0].stops;

            // triggers function to get GPS coordinates of active train
            return getLocation();
        })
        
        req.on('error', error => {
            console.error(error);
            return getContext()
        })    
    })

}

function duration() {
    let endDay = Number(info.info.legs[0].destination.plannedDateTime.slice(8,10));
    let mmDuration = info.info.legs[0].origin.plannedDateTime.slice(14,16);
    let ssDuration = info.info.legs[0].origin.plannedDateTime.slice(17,19);
    let deadlineHour = Number(info.info.legs[0].destination.plannedDateTime.slice(11,13));
    let deadlineMinute = Number(info.info.legs[0].destination.plannedDateTime.slice(14,16));
    let minutesBeforeDeadline = Number(time.now.slice(0, 2) * 60) + Number(time.now.slice(3, 5));

    time.startTime = info.info.legs[0].origin.plannedDateTime.slice(11,19);
    time.durationHours = count;
    time.durationMinutes = Number(time.now.slice(3,5)) - Number(mmDuration);
    time.durationSeconds = Number(time.now.slice(6,8)) - Number(ssDuration);

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

    deadline = ((deadlineHour * 60) + deadlineMinute);

    console.log(minutesBeforeDeadline);
    console.log(deadline);
    if (minutesBeforeDeadline > deadline) {
        if (time.day >= endDay) {
            location.late = true;
        } else {
            location.late = false;
        }
    }
}

// Grabs all current active trains, then iterates through and gives us location of the train for our trip
const getLocation = () => {
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
            let currentHour = Number(time.now.slice(0,2));
            let currentMinute = Number(time.now.slice(3,5));
            let startDay = Number(info.info.legs[0].origin.plannedDateTime.slice(8,10));
            let startHour = Number(info.info.legs[0].origin.plannedDateTime.slice(11,13));
            let startMinute = Number(info.info.legs[0].origin.plannedDateTime.slice(14,16));
            // Grabs lat, lng. Adds to location Object
            for (let i = 0; i < trains.payload.treinen.length; i++) {
                if (trains.payload.treinen[i].treinNummer === legs.product) {
                    location.lat = trains.payload.treinen[i].lat;
                    location.lng = trains.payload.treinen[i].lng;
                    break;
                }
            }

            // changes train status whether if clock is equal to trips planned departure time or not
            if (time.day < startDay) {
                location.status = 'Waiting for departure';
            }

            if (time.day === startDay) {
                if (currentHour - startHour > 0) {
                    if (typeof location.lat == 'undefined') {
                        console.log('No GPS coordinates LINE 242')
                        x += 1;
                        return getContext();
                    }
                    location.status = 'Active';
                }
                if (currentHour - startHour === 0) {
                    if (currentMinute - startMinute >= 0) {
                        if (typeof location.lat == 'undefined') {
                            console.log('No GPS coordinates LINE 251')
                            x += 1;
                            return getContext();
                        }
                        location.status = 'Active';
                    }
                }
            }

            // logic for GPS, if it's active or has not departed. If no GPS location, we call the initial getContext() Function            
            if (location.status === 'Active') {
                if (typeof location.lat == 'undefined') {
                    console.log('No GPS coordinates')
                    x += 1;
                    return getContext();
                }
            }

            // logic to determine whether or not train is at destination
            if (location.lat <= pathLat[pathLat.length - 1] && location.lat >= pathLat[0]) {
                if (location.lng <= pathLng[pathLng.length - 1] && location.lng >= pathLng[0]) {
                    location.status = 'Arrived';
                }
            }
            
            const used = process.memoryUsage();

            for (let key in used) {
                console.log(`Memory: ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
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
        location.status = 'Late';
        location.late = false;
        location.lat = undefined;
        location.lng = undefined;
        stops.stops = undefined;
        context.payload = undefined;
        bounds.length = 0;
        pathLat.length = 0;
        pathLng.length = 0;
        return setTimeout(getContext, 6000)
    }

    if (location.status !== 'Arrived') {
        return setTimeout(getLocation, 3000)
    }
    x = 0;
    location.lat = undefined;
    location.lng = undefined;
    stops.stops = undefined;
    bounds = [];
    pathLat = [];
    pathLng = [];
    context.payload = undefined;
    return setTimeout(getContext, 10000)
}

export function currentTime() {
    let date = new Date();
    let day = date.getUTCDate();
    let hour = date.getUTCHours();
    let minute = date.getUTCMinutes();
    let second = date.getUTCSeconds();
    let month = date.getUTCMonth();
    let timezone = info.info ? info.info.legs[0].origin.plannedDateTime.slice(-3, -2) : null
    let utcMidnightTernary;
    console.log(timezone)
    
    // the if statements below are used to determine wether the timezone is CET or CEST

    if (timezone > 1) {
        hour = date.getUTCHours() + 2;
        utcMidnightTernary = 22;
    } else {
        hour = date.getUTCHours() + 1;
        utcMidnightTernary = 23;
    }

    day = (hour > utcMidnightTernary) ? day = day + 1 : day;
    hour = (hour > 23) ? h = "0" : hour;
    hour = (hour < 10) ? "0" + hour : hour;
    minute = (minute < 10) ? "0" + minute : minute;
    second = (second < 10) ? "0" + second : second;
    
    time.now = hour + ":" + minute + ":" + second;

    time.day = day;

    time.unixSeconds = Math.round(Date.now() / 1000)

    console.log(time);
    
    if (legs.arrivalDate) {
        let msArrival = legs.arrivalDate.getTime()
        let msStart = legs.startDate.getTime()
        time.unixSecondsArrivalTime = Math.round(msArrival / 1000)
        time.unixSecondsStartTime = Math.round(msStart / 1000)
    } else {
        time.unixSecondsArrivalTime = null;
        time.unixSecondsStartTime = null;
    }

    info.info !== undefined ? duration(count):
    console.log("info undefined") 
    
    setTimeout(function() { currentTime() }, 1000);
}
