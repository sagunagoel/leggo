(function (window, leggo, $, undefined) {

  var longitude = null;
  var latitude = null;
  var locationRefreshHandle = null;
  var timeRefreshHandle = null;
  var timeSetHandle = null;
  var activityRefreshHandle = null;
  var c=0000;
  var firstTime=true;
  var currId;
  var activitySelected=false;
  var activityData = {};
  var t;
  var isMouseDown = false;
  
  var currTime;
  var endTime;
  
  var hoursArray = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  var anyTime = true;
  var millisecsAvailable = 0;

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
        console.log("index is now "+ index)
        if (index==5 && activitySelected!=true){
        mySwipe.prev();
      }
        if (index==3 && firstTime) {
        console.log("time filter is here!");
        timedCount();
      }
      if(index==4){
        console.log("what is the time now "+c);
        stopCount(c);
      }
      },
      transitionEnd: function(index, elem) {}
    }); 

    // with jQuery
    // window.mySwipe = $('ß#mySwipe').Swipe().data('Swipe');
    
    $('#help-button').popover(); // does this work?
    getLocation();
    locationRefreshHandle = setInterval(getLocation, 30000);
    
    //set up slightly less fancy time filter
    var myScrollMinutes = new IScroll('#minutes-wrapper', { probeType: 3, mouseWheel: false, bounce: false, startY: 0 });
    myScrollMinutes.scrolling = false;
    myScrollMinutes.selectedIndex = 1;
    myScrollMinutes.on('scrollStart', startTimeScroll);
    myScrollMinutes.on('scroll', updateSelectedTime);
    myScrollMinutes.on('scrollEnd', endTimeScroll);
    
    //make each scroll element clickable
    var lastSelectedIdx = myScrollMinutes.selectedIndex;
    // $('#minutes-scroller ul').children().on('tap', function (e) {
      // e.preventDefault();
      // myScrollMinutes.scrollToElement($(this)[0], null, null, true);
    // }).mousedown(mouseDownScroll).click(mouseUpScroll);
    $('#minutes-scroller ul').children().bind('touchstart', mouseDownScroll)
      .mousedown(mouseDownScroll)
      .bind('touchend', mouseUpScroll)
      .click(mouseUpScroll);
    

    function mouseDownScroll (e) {
      e.preventDefault();
      lastSelectedIdx = myScrollMinutes.selectedIndex;
    }
    
    function mouseUpScroll (e) {
      e.preventDefault();
      if (lastSelectedIdx === myScrollMinutes.selectedIndex) {
        myScrollMinutes.scrollToElement($(this)[0], null, null, true);
      }
    }
    
    function timedCount(){
      firstTime=false;
      c=c+1;
      console.log(c);
      t=setTimeout(function(){timedCount()},1000);
    }

    function stopCount(){
      clearTimeout(t);
      console.log("final time taken was"+c);

      var timeTestData = {
        'finalTime':c
    };

    $.post('/timetest', timeTestData, function (data) {
      console.log(data);
    });
    }
    
    function setDisplayedTime(date) {
      
    }
    
    function updateSelectedTime () {
      this.scrolling = true;
      var yDiff = this.y - 10;
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
      // $(document).bind('touchmove', function (e) { e.preventDefault(); });
      console.log('starting');
    }
    
    function endTimeScroll () {
      updateSelectedTime();
      //15 minutes = 900000 millisecs. Yes this shouldn't be hardcoded
      //Yes I could have fixed that in the time it took to write this comment
      millisecsAvailable = myScrollMinutes.selectedIndex * 900000;
      if (myScrollMinutes.selectedIndex === 1) {
        millisecsAvailable = 0;
      }
      this.scrolling = false;
      // $(document).unbind('touchmove');
      leggo.findActivities();
      console.log('end');
    }
    
    function checkAndSetTime () {
      
    }
    
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
      myScrollMinutes.scrollToElement($('#minutes-scroller ul').children()[1], null, null, true);
      setTimeout(function () { leggo.changeFilter(true); }, 500);
    });
    
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
    // var currPos = mySwipe.getPos();
    // console.log(currPos);
    
  
    // var children = $('.nav-dots').children()[0].children;
    // $(children[currPos]).removeClass('selected');
    
    if (isNext) {
        mySwipe.next();
    } else {
        mySwipe.prev();
    }
    
    // currPos = mySwipe.getPos();
    // $(children[currPos]).addClass('selected');
  }
  
  //aggregates the currently set filters and returns a list of activities that pass said filters
  leggo.findActivities = function (noFilter) {
    currTime = new Date();
    var startStr = currTime.getTime();
    var endStr = currTime.getTime() + millisecsAvailable;
    
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