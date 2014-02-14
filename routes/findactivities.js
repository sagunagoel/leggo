var data = require('../data.json');

exports.filter = function (req, res) {
  var filters = req.body;

  var filtered = data.activities.filter( function (activity) {
    var doesThisMatch = true;
    
    //distance filter
    var activityCoords = activity['coords'];
    var myCoords = filters['coords'];
    var distance = Geolocation.haversine(
      { 'latitude': activityCoords[0],
        'longitude': activityCoords[1], },
      { 'latitude': myCoords[0],
        'longitude': myCoords[1] });
    console.log('distance: ' + distance);
    var myTransportation = filters['transportation'] || [];
    var foundMatch = myTransportation.length === 0;
    for (var i = 0; i < myTransportation.length; i++) {
      if (myTransportation[i] === 'walking' && distance < 3) {
        foundMatch = true;
      } else if (myTransportation[i] === 'biking' && distance < 20) {
        foundMatch = true;
      } else if (myTransportation[i] === 'driving' && distance < 500) {
        foundMatch = true;
      }
    }
    if (!foundMatch) {
      doesThisMatch = false;
    }
  
    //start time filter
    var myStartTime = filters['starttime'];
    var activityStartTime = activity['starttime'];
    var timeDiff = myStartTime - activityStartTime;
    //console.log('starttime diff: ' + timeDiff);
    if (timeDiff < 0) {
      doesThisMatch = false;
    }
    
    //number of people filter. Note that there is no 'minpeople' attribute yet
    var myPeople = filters['people'] || [];
    var foundMatch = myPeople.length === 0;
    for (var i = 0; i < myPeople.length; i++) {
      if (activity['maxpeople'] >= myPeople[i]) {
        foundMatch = true;
      }
    }
    if (!foundMatch) {
      doesThisMatch = false;
    }
    
    //money filter
    var myMoney = filters['money'] || [];
    var foundMatch = myMoney.length === 0;
    for (var i = 0; i < myPeople.length; i++) {
      if (activity['moneyupperlimit'] <= myMoney[i]) {
        foundMatch = true;
      }
    }
    if (!foundMatch) {
      doesThisMatch = false;
    }
    
    return doesThisMatch;
  });

  console.log(filtered);
  res.json({ 'activities' : filtered });
}

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