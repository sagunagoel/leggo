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
        if (index==5 && activitySelected!=true){
        mySwipe.prev();
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
    $('#minutes-scroller ul').children().bind('touchdown', mouseDownScroll)
      .mousedown(mouseDownScroll)
      .bind('touchup', mouseUpScroll)
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
      $(document).bind('touchmove', function (e) { e.preventDefault(); });
      console.log('start');
    }
    
    function endTimeScroll () {
      updateSelectedTime();
      //15 minutes = 900000 millisecs. Yes this shouldn't be hardcoded
      //Yes I could have fixed that in the time it took to write this comment
      var millisecsAvailable = myScrollMinutes.selectedIndex * 900000;
      if (myScrollMinutes.selectedIndex === 1) {
        millisecsAvailable = 0;
      }
      this.scrolling = false;
      $(document).unbind('touchmove');
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
    $.get('../data.json', getProject);
    leggo.changeFilter(true);
  }
  var result;

  function getProject(result)
  {
    activities= result;
    // console.log(result);
    // console.log(currId);
    // console.log(result['activities'][currId-1]);
    $("#img-detail").attr('src', result['activities'][currId-1]['imageURL']);
    $("#descrip-detail").text(result['activities'][currId-1]['description']);
    $("#needs-detail").text(result['activities'][currId-1]['thingslist']);
    $("#cost-detail").text("$" + result['activities'][currId-1]['moneyupperlimit']);
  }  

  leggo.testingfunction = function testingfunction(){
    // console.log(currId);
    window.location.replace("/finalactivity/"+currId);
  }

function callbackFunc(){

  console.log("performed");
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
    currTime = new Date();
    var startStr = currTime.getTime();
    var endStr = currTime.getTime() + millisecsAvailable;
    
    // console.log('start: ' + startStr);
    // console.log('end : ' + endStr);
    var filterData = {
      'nofilter': ((noFilter === undefined) ? false : true),
      'coords': [ latitude, longitude ],
/*
      'starttime':currTime.toDateString() + ' ' + currTime.toTimeString()
*/
      'starttime': startStr,
      'endtime' : endStr
    };
    
    //note that I am pushing filter values to arrays. I'll leave it for now in case we return to non-exclusive buttons
    $('.image-checkbox-checked').each(function (i, n) {
      filterData[$(this).attr('filter')] = filterData[$(this).attr('filter')] || [];
      filterData[$(this).attr('filter')].push($(this).attr('filtervalue'));
      // console.log('filter: ' + $(this).attr('filter') + ' value: ' + $(this).attr('filtervalue'));
    });
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