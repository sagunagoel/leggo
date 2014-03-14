var data = require('../public/data.json');
var models = require('../models');

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

//from internet
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

//taken from some random guy on internet. no longer used
// var Geolocation = {
  // rad: function(x) { return x * Math.PI / 180 },

  // // Distance in kilometers between two points using the Haversine algo.
  // haversine: function(p1, p2) {
    // var R = 6371;
    // var dLat  = this.rad(p2.latitude - p1.latitude);
    // var dLong = this.rad(p2.longitude - p1.longitude);

    // var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            // Math.cos(this.rad(p1.latitude)) * Math.cos(this.rad(p2.latitude)) * Math.sin(dLong/2) * Math.sin(dLong/2);
    // var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    // var d = R * c;

    // return Math.round(d);
  // },

  // // Distance between me and the passed position.
  // distance_from: function(position) {
    // Geolocation.display_location();
    // var distance = Geolocation.haversine(position.coords, current_location);

    // // Sugar: If distance is less than 1km, don't bump into me.
    // if ( distance && distance > 0 ) $("#distance").text(distance + " km")
    // else $("#user_distance").html("<strong>You're close!</strong> Watch my toes!")
  // },

  // // Hide spinner and show location.
  // display_location: function() {
    // $("#user_distance").show()
    // $("#geolocating").hide()
  // }
// }