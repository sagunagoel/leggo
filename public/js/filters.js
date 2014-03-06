(function (window, leggo, $, undefined) {

  var longitude = null;
  var latitude = null;
  var locationRefreshHandle = null;
  var timeRefreshHandle = null;
  var timeSetHandle = null;
  var activityRefreshHandle = null;
  
  var currId;
  var activitySelected=false;
  var activityData = {};
  
  var isMouseDown = false;
  
  var currTime;
  var endTime;
  
  var hoursArray = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  // // clock stuff
  // var hand;
  // var offsets;
  // var handCenter;
  var myScrollAMPM;
  var anyTime = true;

  leggo.initializePage = function () {
    // $('#help-button').popover();
    // pure JS
    var elem = document.getElementById('slider');
    window.mySwipe = Swipe(elem, {
      startSlide: 0,
      speed: 300,
      auto: 0,
      continuous: false,
      disableScroll: false,
      stopPropagation: false,
      callback: function(index, elem) {
        if (index==5 && activitySelected!=true){
        mySwipe.prev();
      }
      },
      transitionEnd: function(index, elem) {}
    });

    // with jQuery
    // window.mySwipe = $('ß#mySwipe').Swipe().data('Swipe');
    
    $('#help-button').popover(); // does this work
    getLocation();
    locationRefreshHandle = setInterval(getLocation, 30000);
    
    //set up fancy time filter
    // position = document.getElementById('position');
    var myScrollHours = new IScroll('#hours-wrapper', { probeType: 3, mouseWheel: false, bounce: false, startY: 0 });
    myScrollHours.scrolling = false;
    myScrollHours.selectedIndex = 1;
    myScrollHours.on('scrollStart', startTimeScroll);
    myScrollHours.on('scroll', updateSelectedTime);
    myScrollHours.on('scrollEnd', endTimeScroll);
    
    var myScrollMinutes = new IScroll('#minutes-wrapper', { probeType: 3, mouseWheel: false, bounce: false, startY: 0 });
    myScrollMinutes.scrolling = false;
    myScrollMinutes.selectedIndex = 1;
    myScrollMinutes.on('scrollStart', startTimeScroll);
    myScrollMinutes.on('scroll', updateSelectedTime);
    myScrollMinutes.on('scrollEnd', endTimeScroll);
    
    myScrollAMPM = new IScroll('#ampm-wrapper', { probeType: 3, mouseWheel: false, bounce: false, startY: 0 });
    myScrollAMPM.scrolling = false;
    myScrollAMPM.selectedIndex = 1;
    myScrollAMPM.on('scrollStart', startTimeScroll);
    myScrollAMPM.on('scroll', updateSelectedTime);
    myScrollAMPM.on('scrollEnd', endTimeScroll);
    
    //make each element clickable
    // $('#hours-scroller ul').children().click( function (e) {
      // e.preventDefault();
      // myScrollHours.scrollToElement($(this)[0], null, null, true);
    // });
    // $('#minutes-scroller ul').children().click( function (e) {
      // e.preventDefault();
      // myScrollMinutes.scrollToElement($(this)[0], null, null, true);
    // });
    // $('#ampm-scroller ul').children().click( function (e) {
      // e.preventDefault();
      // myScrollAMPM.scrollToElement($(this)[0], null, null, true);
    // });
    $('#hours-scroller ul').children().bind('touchstart', function (e) { mouseDownScroll(e, this, myScrollHours); })
      .mousedown( function (e) { mouseDownScroll(e, this, myScrollHours); })
      .bind('touchend', function (e) { mouseUpScroll(e, this, myScrollHours); })
      .click( function (e) { mouseUpScroll(e, this, myScrollHours); });
      
    $('#minutes-scroller ul').children().bind('touchstart', function (e) { mouseDownScroll(e, this, myScrollMinutes); })
      .mousedown( function (e) { mouseDownScroll(e, this, myScrollMinutes); })
      .bind('touchend', function (e) { mouseUpScroll(e, this, myScrollMinutes); })
      .click( function (e) { mouseUpScroll(e, this, myScrollMinutes); });
      
    $('#ampm-scroller ul').children().bind('touchstart', function (e) { mouseDownScroll(e, this, myScrollAMPM); })
      .mousedown( function (e) { mouseDownScroll(e, this, myScrollAMPM); })
      .bind('touchend', function (e) { mouseUpScroll(e, this, myScrollAMPM); })
      .click( function (e) { mouseUpScroll(e, this, myScrollAMPM); });
    
        // $('#minutes-scroller ul').children()
      // .bind('touchstart', function (e) { mouseDownScroll(e, this, myScroll); })
      // .mousedown( function (e) { mouseDownScroll(e, this, myScroll); })
      // .bind('touchend', function (e) { mouseUpScroll(e, this, myScroll); })
      // .click( function (e) { mouseUpScroll(e, this, myScroll); });
    
    // var lastSelectedHours = myScrollHours.selectedIndex;
    // var lastSelectedMinutes = myScrollMinutes.selectedIndex;
    // var lastSelectedAMPM = myScrollAMPM.selectedIndex;
    
    function mouseDownScroll (e, myThis, myScroll) {
      e.preventDefault();
      myScroll.lastSelectedIndex = myScroll.selectedIndex;
    }
    
    function mouseUpScroll (e, myThis, myScroll) {
      e.preventDefault();
      if (myScroll.selectedIndex === myScroll.lastSelectedIndex) {
        myScroll.scrollToElement($(myThis)[0], null, null, true);
      }
    }
    
    
    function setDisplayedTime(date) {
      //scroll to and highlight the hour
      var numHours = (date.getHours() < 12) ? date.getHours() : date.getHours() - 12;
      var hoursOptions = $($(myScrollHours.scroller).children('ul')[0]).children();
      hoursOptions.removeClass('selected-time').removeClass('selected-time-gray');
      myScrollHours.selectedIndex = numHours + 1;
      myScrollHours.scrollToElement(hoursOptions[myScrollHours.selectedIndex], null, null, true);
      $(hoursOptions[myScrollHours.selectedIndex]).addClass('selected-time');
      //check if "any time" is selected
      if (myScrollAMPM.selectedIndex == 1) {
        $(hoursOptions[myScrollHours.selectedIndex]).addClass('selected-time-gray');
      }
      
      //scroll to and highlight the minutes
      var minutesOptions = $($(myScrollMinutes.scroller).children('ul')[0]).children();
      minutesOptions.removeClass('selected-time').removeClass('selected-time-gray');
      myScrollMinutes.selectedIndex = date.getMinutes() + 1;
      myScrollMinutes.scrollToElement(minutesOptions[myScrollMinutes.selectedIndex], null, null, true);
      $(minutesOptions[myScrollMinutes.selectedIndex]).addClass('selected-time');
      //check if "any time" is selected
      if (myScrollAMPM.selectedIndex == 1) {
        $(minutesOptions[myScrollMinutes.selectedIndex]).addClass('selected-time-gray');
      }
      
      if (myScrollAMPM.selectedIndex > 1) {
        var ampmOptions = $($(myScrollAMPM.scroller).children('ul')[0]).children();
        ampmOptions.removeClass('selected-time').removeClass('selected-time-gray');
        myScrollAMPM.selectedIndex = (date.getHours() < 12) ? 2 : 3 ;
        myScrollAMPM.scrollToElement(ampmOptions[myScrollAMPM.selectedIndex], null, null, true);
        $(ampmOptions[myScrollAMPM.selectedIndex]).addClass('selected-time');
      }
    }
    
    function updateSelectedTime () {
      var yDiff = this.y - 10;
      var idx = Math.floor(-1*yDiff/40) + 1;
      if (this.selectedIndex === undefined || this.selectedIndex !== idx) {
        this.selectedIndex = idx;
        var options = $($(this.scroller).children('ul')[0]).children();
        $(options).removeClass('selected-time').removeClass('selected-time-gray');
        $(options[idx]).addClass('selected-time');
        if (myScrollAMPM.selectedIndex == 1 && this !== myScrollAMPM) {
          $(options[idx]).addClass('selected-time-gray');
        }
      }
    }
    
    function startTimeScroll () {
      this.scrolling = true;
      // $(document).bind('touchmove', function (e) { e.preventDefault(); });
      console.log('start');
    }
    
    function endTimeScroll () {
      updateSelectedTime();
      //check if new endtime is valid. If so, set endtime. if not, reset to currtime
      checkAndSetTime();
      this.scrolling = false;
      // $(document).unbind('touchmove');
      console.log('end');
    }
    
    function setToAnyTime () {
      anyTime = true;
      var ampmOptions = $($(myScrollAMPM.scroller).children('ul')[0]).children();
      ampmOptions.removeClass('selected-time').removeClass('selected-time-gray');
      myScrollAMPM.selectedIndex = 1;
      myScrollAMPM.scrollToElement(ampmOptions[myScrollAMPM.selectedIndex], null, null, true);
      $(ampmOptions[myScrollAMPM.selectedIndex]).addClass('selected-time');
      
      checkAndSetTime();
    }
    
    var lastAMPM = 0;
    function checkAndSetTime () {
      // var isPM = myScrollAMPM.selectedIndex - 2;
      var hoursOptions = $($(myScrollHours.scroller).children('ul')[0]).children();
      var minutesOptions = $($(myScrollMinutes.scroller).children('ul')[0]).children();
      if (myScrollAMPM.selectedIndex === 1) {
        anyTime = true;
        $(hoursOptions[myScrollHours.selectedIndex]).addClass('selected-time-gray');
        $(minutesOptions[myScrollMinutes.selectedIndex]).addClass('selected-time-gray');
        
      } else {
        anyTime = false;
        minutesOptions.removeClass('selected-time-gray');
        hoursOptions.removeClass('selected-time-gray');
        lastAMPM = myScrollAMPM.selectedIndex - 2;
      }
      var numHours = myScrollHours.selectedIndex - 1 + ((lastAMPM === 1) ? 12 : 0);
      console.log(numHours);
      endTime.setHours(numHours);
      // endTime.setHours(myScrollHours.selectedIndex - 1);
      endTime.setMinutes(myScrollMinutes.selectedIndex - 1);

      //minimum time to spend is 30 minutes
      if (endTime.getTime() - currTime.getTime() < 1800000) {
        endTime.setTime(currTime.getTime() + 1800000);
        setDisplayedTime(endTime);
      }
    }
    
    // set up time filter. If the current time catches up to the listed end time, the end time will increment with the current time.
    currTime = new Date();
    endTime = new Date(currTime.getTime() + 1800000);
    setDisplayedTime(endTime);
    lastAMPM = (endTime.getHours() < 12) ? 0 : 1;
    timeRefreshHandle = setInterval(function () {
      currTime = new Date();
      // if (currTime.getTime() > endTime.getTime()) {
      //minimum time to spend is 30 minutes
      if (endTime.getTime() - currTime.getTime() < 1800000) {
        endTime.setTime(currTime.getTime() + 1800000);
        if (!myScrollHours.scrolling && !myScrollMinutes.scrolling && !myScrollAMPM.scrolling) {
          setDisplayedTime(endTime);
          lastAMPM = (endTime.getHours() < 12) ? 0 : 1;
        }
      }
    }, 1000);
    
    //enable filter buttons
    $('.image-checkbox').each(function (i, n) {
      $(this).click( function (e) {
        console.log('hi!');
        e.preventDefault();
        var button = $(this);
        if (button.hasClass('image-checkbox-checked')) {
          button.removeClass('image-checkbox-checked');
          button.addClass('image-checkbox');
          deselectButton(button);
        } else {
          button.removeClass('image-checkbox');
          console.log(button.siblings('.image-checkbox-checked'));
          button.siblings('.image-checkbox-checked').removeClass('image-checkbox-checked').addClass('image-checkbox')
            .each( function () {
              deselectButton(this);
            });
          button.addClass('image-checkbox-checked');
          selectButton(button);
        }
        leggo.findActivities();
        setTimeout(function () { leggo.changeFilter(true); }, 500);
      });
    });
    
    //deselects all the filter options on the current filter
    $('.surprise-button').each(function (i, n) {
      $(this).click( function (e) {
        e.preventDefault();
        var buttons = $(this).parent().parent().find('.icons').children().removeClass('image-checkbox-checked').addClass('image-checkbox')
          .each( function () {
            deselectButton(this);
          });
        setTimeout(function () { leggo.changeFilter(true); }, 500);
      });
    });
    $('#time-surprise').unbind('click').click( function (e) {
      e.preventDefault();
      // $('#time-display').text(toClockString(currTime));
      // $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
      // endTime = new Date(currTime.getTime());
      setToAnyTime();
      setTimeout(function () { leggo.changeFilter(true); }, 500);
    });
    
    //set click events for increasing and decreasing "endtime" filter
    //note that ajax won't fire repeatedly if the user rapidly increments/decrements the time
    // $('#increment-endtime').click( function (e) {
      // e.preventDefault();
      // leggo.changeEndTime(5);
      // if (timeSetHandle !== null) {
        // clearTimeout(timeSetHandle);
      // }
      // timeSetHandle = setTimeout(function () {
        // leggo.findActivities();
      // }, 500);
    // });
    // $('#decrement-endtime').click( function (e) {
      // e.preventDefault();
      // leggo.changeEndTime(-5);
      // if (timeSetHandle !== null) {
        // clearTimeout(timeSetHandle);
      // }
      // timeSetHandle = setTimeout(function () {
        // leggo.findActivities();
      // }, 500);
    // });
    
    //enable refresh button. gets new activities
    $('#refresh-button').click( function (e) {
      e.preventDefault();
      leggo.findActivities();
    });
    

    var derp = setTimeout(leggo.findActivities, 2000);
    activityRefreshHandle = setInterval(leggo.findActivities, 300000);
    
  }
  
  //These next two functions switch the img src of a button with the appropriate selected/unselected image
  function deselectButton (button) {
    var newURL = $(button).attr('src');
    if (newURL !== undefined) {
      newURL = newURL.split('_')[0];
      newURL = newURL + '_unsel.png';
      $(button).attr('src', newURL);
    }
  }
  function selectButton (button) {
    var newURL = $(button).attr('src');
    if (newURL !== undefined) {
      newURL = newURL.split('_')[0];
      newURL = newURL + '_selected.png';
      $(button).attr('src', newURL);
    }
  }
  
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(storePosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
  function toClockString (date) {
    var isPM = date.getHours() >= 12;
    //return ((isPM) ? date.getHours() - 12 : date.getHours()) + ':' + (((date.getMinutes() < 10) ? '0' : '') + currTime.getMinutes()) + ((isPM) ? 'PM' : 'AM');
    return ((date.getHours() >= 12) ? hoursArray[date.getHours() - 12] : hoursArray[date.getHours()]) + ':' + ( (date.getMinutes()<10?'0':'') + date.getMinutes() ) + ' ' + ((isPM) ? 'PM' : 'AM');
  }
  
  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
  }
  
  //adds "amount" minutes to the end time filter
  leggo.changeEndTime = function changeEndTime(amount) {
    endTime = addMinutes(endTime, amount);
    if ( endTime.getTime() < currTime.getTime() ) {
      currTimeStr = toClockString(currTime);//((currTime.getHours() > 12) ? currTime.getHours() - 12 : currTime.getHours()) + ':' + ( (currTime.getMinutes()<10?'0':'') + currTime.getMinutes() );
      $('#time-display').text(currTimeStr);
      $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
    } else {
      endTimeStr = toClockString(endTime);
      $('#time-display').text(endTimeStr);
      $('#time-display').attr('filterValue', endTime.toDateString() + ' ' + endTime.toTimeString());
    }
  }
  
  leggo.setActivityID = function setActivityID(id){
    currId= id;
    console.log("Curr id is now" + id);
  }

  leggo.activityClicked= function activityClicked(isNext,id){
    activitySelected=true;
    leggo.setActivityID(id);
    // $.get('../data.json', getProject);
    for (var i=0; i<activityData.length; ++i) {
      if (activityData[i]['id'] === id) {
        showActivity(activityData[i]);
      }
    }
    leggo.changeFilter(true);
  }
  // var result;
  
  function showActivity(activity) {
    $("#img-detail").attr('src', activity['imageURL']);
    $("#descrip-detail").text(activity['description']);
    $("#needs-detail").text(activity['thingslist']);
    $("#cost-detail").text("$" + activity['moneyupperlimit']);
  }

  // function getProject(result)
  // {
    // activities= result;
    // console.log(result);
    // console.log(currId);
    // console.log(result['activities'][currId-1]);
    // $("#img-detail").attr('src', result['activities'][currId-1]['imageURL']);
    // $("#descrip-detail").text(result['activities'][currId-1]['description']);
    // $("#needs-detail").text(result['activities'][currId-1]['thingslist']);
    // $("#cost-detail").text("$" + result['activities'][currId-1]['moneyupperlimit']);
  // }  

  leggo.testingfunction = function testingfunction(){
    // console.log(currId);
    window.location.replace("/finalactivity/"+currId);
  }

function callbackFunc(){

  // console.log("performed");
}
  
  function storePosition(position) {
    longitude = position.coords.longitude;
    latitude = position.coords.latitude;
    console.log('position stored: ');
    // leggo.findActivities();
  }
  
  //swipes the current filter forward if isNext is true, backward if not
  leggo.changeFilter = function changeFilter (isNext) {
    var currPos = mySwipe.getPos();
    // console.log(currPos);
    
  
    var children = $('.nav-dots').children()[0].children;
    $(children[currPos]).removeClass('selected');
    
    if (isNext) {
        mySwipe.next();
    } else {
        mySwipe.prev();
    }
    
    currPos = mySwipe.getPos();
    $(children[currPos]).addClass('selected');
  }
  
  //aggregates the currently set filters and returns a list of activities that pass said filters
  leggo.findActivities = function (noFilter) {
    // currTime = new Date();    
    // var startStr = currTime.toDateString() + ' ' + currTime.toTimeString();
    var startStr = currTime.getTime();
    // var endStr = (anyTime) ? startStr : endTime.toDateString() + ' ' + endTime.toTimeString();
    var endStr = (anyTime) ? currTime.getTime() : endTime.getTime();
    
    // console.log('start: ' + startStr);
    // console.log('end : ' + endStr);
    var filterData = {
      'nofilter': ((noFilter === undefined) ? false : true),
      'coords': (latitude === null || longitude === null) ? [] : [ latitude, longitude ], //empty array if location data missing
/*
      'starttime':currTime.toDateString() + ' ' + currTime.toTimeString()
*/
      'starttime': startStr,
      'endtime' : (noFilter) ? startStr : endStr
    };
    
    //note that I am pushing filter values to arrays. I'll leave it for now in case we return to non-exclusive buttons
    if (!noFilter) {
      $('.image-checkbox-checked').each(function (i, n) {
        filterData[$(this).attr('filter')] = filterData[$(this).attr('filter')] || [];
        filterData[$(this).attr('filter')].push($(this).attr('filtervalue'));
        // console.log('filter: ' + $(this).attr('filter') + ' value: ' + $(this).attr('filtervalue'));
      });
    }
    $.post('/findactivities', filterData, function (data) {
      activityData = data['activities'];
      populateActivities(activityData);
      
      console.log(data);
    });
  }
  
  //adds activities to the activities page
  function populateActivities (activities) {
    if (activities.length == 0) {
      $('#activities-intro').text('We couldn\'t find anything matching your filters, so here\'s a random selection...');
      leggo.findActivities(true);
      return;
    }
  
    var count = 0;
    $('#activities').children().each( function () {
      var newActivity = activities[count] || false;
    
      var activityAnchor = $(this).find('a');
      var activityImage = $(this).find('img');
      
      var activityID = $(activityAnchor).attr('activityid');
      activityAnchor.unbind('click');
      if (newActivity) {
        $(this).show();
        activityAnchor.click( function (e) {
          e.preventDefault();
          leggo.activityClicked(true, newActivity['id']);
        });
        $(activityImage).attr('src', newActivity['imageURL']);
      } else {
        $(this).hide();
      }
      
      count++;
    });
  }

})(this, window.leggo = window.leggo || {}, jQuery);