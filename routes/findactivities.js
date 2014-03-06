var data = require('../public/data.json');
var models = require('../models');

exports.filterDB = function (req, res) {
  
}

// NOTE: Right now it's set up to handle non-exclusive options for each filter. This isn't currently necessary, but I don't feel like taking it out
exports.filter = function (req, res) {
  var filters = req.body;
  console.log(filters);
  
  // var filtered = data.activities;
  // var queryConditions = { 'moneyupperlimit' : (filters.energy) ? {
  
  // if (filters.transportation !== undefined && filters.coords.length !== 0)
    // queryGuts['loc'] = {
      // $nearSphere: {
        // type: 'Point',
        // coordinates: [ parseFloat(filters.coords[1]), parseFloat(filters.coords[0]) ]
      // },
      // $maxDistance: (filters.transportation[0] === 'walking') ? 1000 : ((filters.transportation[0] === 'biking') ? 3000 : 16000)
    // };
  
  var queryGuts = {};
  if (filters.energy !== undefined)
    queryGuts['energylevel'] = parseInt(filters.energy[0]);
  if (filters.money !== undefined)
    queryGuts['moneyupperlimit'] = { $lte: parseInt(filters.money[0]) };
    
  var query = models.Activity.find(queryGuts);
  if (filters.transportation !== undefined && filters.coords.length !== 0)
    query.near('loc', {
      center: {
        type: 'Point',
        coordinates: [ parseFloat(filters.coords[1]), parseFloat(filters.coords[0]) ]
      },
      maxDistance: (filters.transportation[0] === 'walking') ? 1000 : ((filters.transportation[0] === 'biking') ? 3000 : 16000)
    });
    
  query.exec(afterQuery);
  
  function afterQuery (err, activities) {
    if(err) console.log(err);
    // console.log('mongostuff: ', activities);
    
    if (filters.transportation !== undefined && filters.coords.length !== 0) {
      var secondQuery = models.Activity.find(queryGuts);
      secondQuery.near('loc', {
        center: {
          type: 'Point',
          coordinates: [ 0.0, 0.0 ]
        },
        maxDistance: 1
      });

      secondQuery.exec(afterQueryTwo);
    } else {
      afterQueryTwo(err, []);
    }
    
    function afterQueryTwo (err, anywhereActivities) {
      if(err) console.log(err);

      combinedActivities = activities.concat(anywhereActivities);

      combinedActivities = combinedActivities.filter( function(activity) {
        //time filter. Is it open + do I have enough time. Note that transportation is NOT considered
        //fix for time zone
        var startDate = new Date(parseInt(filters['starttime']) - 28800000);
        console.log('start: ' + startDate.toDateString() + ' ' + startDate.toTimeString());
        //fix for time zone
        var endDate = new Date(parseInt(filters['endtime']) - 28800000);
        var totalMillisecs = (endDate.getTime() - startDate.getTime());
        //if time <= 30 minutes, just pass the filter...
        var foundMatch = true;
        if (totalMillisecs < activity['length']*3600000 && totalMillisecs >= 1800000) {
          foundMatch = false;
        } else {
          foundMatch = checkDay(startDate, activity);
        }
        
        return foundMatch;
      });
      
      for (var i=0; i<combinedActivities.length; ++i)
        console.log(combinedActivities[i].name);
      
      var returnSize = (combinedActivities.length > 3) ? 3 : combinedActivities.length;
      res.json({ 'activities' : getRandomSubarray(combinedActivities, returnSize) });
      
    }
    
  }
  // if (filters.transportation !== undefined && filters.coords.length !== 0) {
    // query.or([{ loc: {
        // $nearSphere: {
          // type: "Point",
          // coordinates: [ parseFloat(filters.coords[1]), parseFloat(filters.coords[0]) ]
        // },
        // $maxDistance: (filters.transportation[0] === 'walking') ? 1000 : ((filters.transportation[0] === 'biking') ? 3000 : 16000)
      // }
    // },{ loc: {
        // $nearSphere: {
          // type: "Point",
          // coordinates: [ 0.0, 0.0 ]
        // },
        // $maxDistance: 1
      // }
    // }]);
  // }
  
  
  // if (filters['nofilter'] === 'false') {
    // filtered = data.activities.filter( function (activity) {
      // var doesThisMatch = true;
      
      // //distance filter
      // var activityCoords = activity['coords'];
      // var myCoords = filters['coords'];
      // var distance = Geolocation.haversine(
        // { 'latitude': activityCoords[0],
          // 'longitude': activityCoords[1], },
        // { 'latitude': myCoords[0],
          // 'longitude': myCoords[1] });
      // //console.log('distance: ' + distance);
      // var myTransportation = filters['transportation'] || [];
      // var foundMatch = myTransportation.length === 0;
      // // check if activity has no location. right now that means coords (0, 0)
      // if (activityCoords[0] === 0 && activityCoords[1] === 0) {
        // foundMatch = true;
        // distance = 0;
      // }
      // for (var i = 0; i < myTransportation.length; i++) {
        // if (myTransportation[i] === 'walking' && distance < 3) {
          // foundMatch = true;
        // } else if (myTransportation[i] === 'biking' && distance < 20) {
          // foundMatch = true;
        // } else if (myTransportation[i] === 'driving' && distance < 500) {
          // foundMatch = true;
        // }
      // }
      // if (!foundMatch) {
        // doesThisMatch = false;
      // }
    
      // //time filter. Is it open + do I have enough time. Note that transportation is NOT considered
      // // var startDate = new Date(Date.parse(filters['starttime']));
      // //fix for time zone
      // var startDate = new Date(parseInt(filters['starttime']) - 28800000);
      // // startDate = new Date();
      // // console.log('start: ' + startDate.toDateString());
      // // var endDate = new Date(Date.parse(filters['endtime']));
      // //fix for time zone
      // var endDate = new Date(parseInt(filters['endtime']) - 28800000);
      
      // var totalMillisecs = (endDate.getTime() - startDate.getTime());
      // // totalMillisecs = 1800000;
      // // console.log('hours: ' + totalMillisecs);
      // //if time <= 30 minutes, just pass the filter...
      // if (totalMillisecs < activity['length']*3600000 && totalMillisecs >= 1800000) {
        // doesThisMatch = false;
      // } else if (totalMillisecs >= 1800000) {
        // var hasWeekDays = activity['hours']['weekDays'] !== undefined;
        // var hasWeekEnds = activity['hours']['weekEnds'] !== undefined;
        
        // var foundMatch = checkDay(startDate, activity);
        // if (!foundMatch) {
          // doesThisMatch = false;
        // }
      // }


      // // var myStartTime = parseInt(filters['starttime']);
      // // var activityStartTime = activity['starttime'];
      // // var timeDiff = myStartTime - activityStartTime;
      // // //console.log('starttime diff: ' + timeDiff);
      // // if (timeDiff < 0) {
        // // doesThisMatch = false;
      // // }
      
      // //energy level filter
      // var myEnergy = filters['energy'] || [];
      // //if there is no energy filter specified, all activities match
      // var foundMatch = myEnergy.length === 0;
      // for (var i = 0; i < myEnergy.length; i++) {
        // if (activity['energylevel'] <= parseInt(myEnergy[i])) {
          // foundMatch = true;
        // }
      // }
      // if (!foundMatch) {
        // doesThisMatch = false;
      // }
      
      // //number of people filter. This is currently not used
      // var myPeople = filters['people'] || [];
      // var foundMatch = myPeople.length === 0;
      // for (var i = 0; i < myPeople.length; i++) {
        // if (activity['maxpeople'] >= parseInt(myPeople[i])) {
          // foundMatch = true;
        // }
      // }
      // if (!foundMatch) {
        // doesThisMatch = false;
      // }
      
      // //money filter
      // var myMoney = filters['money'] || [];
      // //console.log(activity['moneyupperlimit'] <= parseInt(myMoney[i]));
      // var foundMatch = myMoney.length === 0;
      // for (var i = 0; i < myMoney.length; i++) {
        // if (activity['moneyupperlimit'] <= parseInt(myMoney[i])) {
          // // console.log('theirmoney: ' + activity['moneyupperlimit']);
          // // console.log('mymoney: ' + parseInt(myMoney[i]));
          // foundMatch = true;
        // }
      // }
      // if (!foundMatch) {
        // doesThisMatch = false;
      // }
      // if (doesThisMatch) {
        // activity['distance'] = distance;
      // }
      // return doesThisMatch;
    // });
  // }
  // //console.log(filtered);
  // //truncate and shuffle results
  // var returnedActivities = filtered;
  // if (filtered.length > 3) {
    // var indices = [0, 1, 2];
    // indices[1] = Math.floor(1 + Math.random()*(filtered.length - 2));
    // indices[0] = Math.floor(Math.random()*indices[1]);
    // indices[2] = Math.floor(indices[1] + 1 + Math.random()*(filtered.length - indices[1] - 1));
    // returnedActivities = [ filtered[indices[0]], filtered[indices[1]], filtered[indices[2]] ];
  // }
  
  // res.json({ 'activities' : returnedActivities });
}

function checkDay (start, activity) {
  var startDay = start.getDay();
  var startTime = (start.getHours() + start.getMinutes()/60);
  var days = ['sundays', 'mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays'];
  
  if (activity['hours']['allDays'] !== undefined && activity['hours']['allDays']['starttime'].length > 0) {
    return checkTime(startTime, activity['hours']['allDays']['starttime'], activity['hours']['allDays']['endtime']);
  }
  if (startDay < 5) {
    if (activity['hours']['weekDays'] !== undefined && activity['hours']['weekDays']['starttime'].length > 0) {
      return checkTime(startTime, activity['hours']['weekDays']['starttime'], activity['hours']['weekDays']['endtime']);
      
    } else if (activity['hours'][days[startDay]] !== undefined && activity['hours'][days[startDay]]['starttime'].length > 0) {
      return checkTime(startTime, activity['hours'][days[startDay]]['starttime'], activity['hours'][days[startDay]]['endtime']);
      
    } else {
      return false;
    }
  } else {
    if (activity['hours']['weekEnds'] !== undefined && activity['hours']['weekEnds']['starttime'].length > 0) {
      return checkTime(startTime, activity['hours']['weekEnds']['starttime'], activity['hours']['weekEnds']['endtime']);
      
    } else if (activity['hours'][days[startDay]] !== undefined && activity['hours'][days[startDay]]['starttime'].length > 0) {
      return checkTime(startTime, activity['hours'][days[startDay]]['starttime'], activity['hours'][days[startDay]]['endtime']);
      
    } else {
      return false;
    }
  }
  return false;
}

function checkTime (myTime, theirStartTimes, theirEndTimes) {
  var foundMatch = false;
  for (var i = 0; i < theirStartTimes.length; i++) {
    if (myTime >= parseFloat(theirStartTimes[i]) && myTime <= parseFloat(theirEndTimes[i])) {
      // console.log(myTime);
      return true;
    }
  }
  return false;
}

function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

//taken from some random guy on internet
var Geolocation = {
  rad: function(x) { return x * Math.PI / 180 },

  // Distance in kilometers between two points using the Haversine algo.
  haversine: function(p1, p2) {
    var R = 6371;
    var dLat  = this.rad(p2.latitude - p1.latitude);
    var dLong = this.rad(p2.longitude - p1.longitude);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.rad(p1.latitude)) * Math.cos(this.rad(p2.latitude)) * Math.sin(dLong/2) * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return Math.round(d);
  },

  // Distance between me and the passed position.
  distance_from: function(position) {
    Geolocation.display_location();
    var distance = Geolocation.haversine(position.coords, current_location);

    // Sugar: If distance is less than 1km, don't bump into me.
    if ( distance && distance > 0 ) $("#distance").text(distance + " km")
    else $("#user_distance").html("<strong>You're close!</strong> Watch my toes!")
  },

  // Hide spinner and show location.
  display_location: function() {
    $("#user_distance").show()
    $("#geolocating").hide()
  }
}