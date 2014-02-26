(function (window, leggo, $, undefined) {

  var longitude = null;
  var latitude = null;
  var locationRefreshHandle = null;
  var timeRefreshHandle = null;
  var timeSetHandle = null;
  var activityRefreshHandle = null;
  
  var currId;
  
  var activityData = {};
  
  var isMouseDown = false;
  
  var currTime;
  var endTime;
  
  var hoursArray = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  // // clock stuff
  // var hand;
  // var offsets;
  // var handCenter;

  leggo.initializePage = function () {
    // $('#help-button').popover();
    // pure JS
    var elem = document.getElementById('slider');
    window.mySwipe = Swipe(elem, {
      // startSlide: 4,
      // auto: 3000,
      // continuous: true,
      // disableScroll: true,
      // stopPropagation: true,
      // callback: function(index, element) {},
      // transitionEnd: function(index, element) {}
    });

    // with jQuery
    // window.mySwipe = $('#mySwipe').Swipe().data('Swipe');
    
    $('#help-button').popover(); // does this work
    getLocation();
    locationRefreshHandle = setInterval(getLocation, 30000);
    
    //set up fancy time filter
    // position = document.getElementById('position');
    var myScrollHours = new IScroll('#hours-wrapper', { probeType: 3, mouseWheel: false, bounce: false });
    myScrollHours.scrolling = false;
    myScrollHours.selectedIndex = 1;
    myScrollHours.on('scrollStart', startTimeScroll);
    myScrollHours.on('scroll', updateSelectedTime);
    myScrollHours.on('scrollEnd', endTimeScroll);
    
    var myScrollMinutes = new IScroll('#minutes-wrapper', { probeType: 3, mouseWheel: false, bounce: false });
    myScrollMinutes.scrolling = false;
    myScrollMinutes.selectedIndex = 1;
    myScrollMinutes.on('scroll', startTimeScroll);
    myScrollMinutes.on('scroll', updateSelectedTime);
    myScrollMinutes.on('scrollEnd', endTimeScroll);
    
    var myScrollAMPM = new IScroll('#ampm-wrapper', { probeType: 3, mouseWheel: false, bounce: false });
    myScrollAMPM.scrolling = false;
    myScrollAMPM.selectedIndex = 1;
    myScrollAMPM.on('scroll', startTimeScroll);
    myScrollAMPM.on('scroll', updateSelectedTime);
    myScrollAMPM.on('scrollEnd', endTimeScroll);

    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
    
    
    function setSelectedTime(date) {
      //scroll to and highlight the hour
      var numHours = (date.getHours() < 12) ? date.getHours() : date.getHours() - 12;
      var hoursOptions = $($(myScrollHours.scroller).children('ul')[0]).children();
      hoursOptions.removeClass('selected-time');
      myScrollHours.scrollToElement(hoursOptions[numHours + 1], null, null, true);
      $(hoursOptions[numHours + 1]).addClass('selected-time');
      myScrollHours.selectedIndex = numHours + 1;
      
      //scroll to and highlight the minutes
      var minutesOptions = $($(myScrollMinutes.scroller).children('ul')[0]).children();
      minutesOptions.removeClass('selected-time');
      myScrollMinutes.scrollToElement(minutesOptions[date.getMinutes() + 1], null, null, true);
      $(minutesOptions[date.getMinutes() + 1]).addClass('selected-time');
      myScrollMinutes.selectedIndex = date.getMinutes() + 1;
    }
    
    function updateSelectedTime () {
      var yDiff = this.y - 25;
      var idx = Math.floor(-1*yDiff/40) + 1;
      if (this.selectedIndex === undefined || this.selectedIndex !== idx) {
        this.selectedIndex = idx;
        var options = $($(this.scroller).children('ul')[0]).children();
        $(options).removeClass('selected-time');
        $(options[idx]).addClass('selected-time');
      }
    }
    
    function startTimeScroll () {
      this.scrolling = true;
    }
    
    function endTimeScroll () {
      updateSelectedTime();
      //check if new endtime is valid. If so, set endtime. if not, reset to currtime
      checkAndSetTime();
      this.scrolling = false;
    }
    
    function checkAndSetTime () {
      var isPM = myScrollAMPM.selectedIndex - 1;
      endTime.setHours(myScrollHours.selectedIndex - 1 + 12*isPM);
      endTime.setMinutes(myScrollMinutes.selectedIndex - 1);

      if (endTime.getTime() < currTime.getTime()) {
        endTime.setTime(currTime.getTime());
        setSelectedTime(currTime);
      }
    }
    
    // set up time filter. If the current time catches up to the listed end time, the end time will increment with the current time.
    currTime = new Date();
    // $('#time-display').text(toClockString(currTime));
    // $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
    endTime = new Date(currTime.getTime());
    timeRefreshHandle = setInterval(function () {
      currTime = new Date();
      if (currTime.getTime() > endTime.getTime()) {
        // currTimeStr = ((currTime.getHours() > 12) ? currTime.getHours() - 12 : currTime.getHours()) + ':' + ((currTime.getMinutes()<10?'0':'') + currTime.getMinutes());
        // $('#time-display').text(toClockString(currTime));
        // $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
        endTime.setTime(currTime.getTime());
        if (!myScrollHours.scrolling && !myScrollMinutes.scrolling && !myScrollAMPM.scrolling) {
          setSelectedTime(endTime);
        }
        // myScroll.scrollToElement(document.querySelector('#scroller li:nth-child(25)'), null, null, true)
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
      $('#time-display').text(toClockString(currTime));
      $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
      endTime = new Date(currTime.getTime());
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
    

    leggo.findActivities();
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
    leggo.setActivityID(id);
    $.get('../../data.json', getProject);
    leggo.changeFilter(true);
  }
  var result;

  function getProject(result)
  {
    console.log(result);
    console.log(currId);
    console.log(result['activities'][currId-1]);
    $("#img-detail").attr('src', result['activities'][currId-1]['imageURL']);
    $("#descrip-detail").text(result['activities'][currId-1]['description']);
     $("#needs-detail").text(result['activities'][currId-1]['thingslist']);
     $("#cost-detail").text("$" + result['activities'][currId-1]['moneyupperlimit']);
  }  

  leggo.testingfunction = function testingfunction(){
    console.log(currId);
    window.location.replace("/finalactivity/"+currId);
    // $("#finaldetails").load("/chosenactivity", currId, callbackFunc);
    // $("#finaldetails").text("<p>KILL ME NOW </p>");
  }

function callbackFunc(){

  console.log("performed");
}
  
  function storePosition(position) {
    longitude = position.coords.longitude;
    latitude = position.coords.latitude;
    console.log('position stored: ');
    leggo.findActivities();
  }
  
  //swipes the current filter forward if isNext is true, backward if not
  leggo.changeFilter = function changeFilter (isNext) {
    var currPos = mySwipe.getPos();
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
  leggo.findActivities = function () {
    currTime = new Date();    
    var startTime = currTime.getHours() + currTime.getMinutes()/60;
    
    var someData = {
      'coords': [ latitude, longitude ],
      'starttime': currTime.toDateString() + ' ' + currTime.toTimeString(),
      'endtime' : endTime.toDateString() + ' ' + endTime.toTimeString()
    };
    
    //note that I am pushing filter values to arrays. I'll leave it for now in case we return to non-exclusive buttons
    $('.image-checkbox-checked').each(function (i, n) {
      someData[$(this).attr('filter')] = someData[$(this).attr('filter')] || [];
      someData[$(this).attr('filter')].push($(this).attr('filtervalue'));
      // console.log('filter: ' + $(this).attr('filter') + ' value: ' + $(this).attr('filtervalue'));
    });
    $.post('/findactivities', someData, function (data) {
      activityData = data['activities'];
      populateActivities(activityData);
      
      console.log(data);
    });
  }
  
  //adds activities to the activities page
  function populateActivities (activities) {
    if (activities.length == 0) {
      $('#activities-intro').text('No matches found! Edit your filters and try again...');
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