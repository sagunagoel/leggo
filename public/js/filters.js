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
    
    $('#help-button').popover();
    getLocation();
    locationRefreshHandle = setInterval(getLocation, 60000);
    
    // set up time filter
    currTime = new Date();
    $('#time-display').text(currTime.getHours() + ':' + currTime.getMinutes() + ':' + currTime.getSeconds());
    $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
    endTime = new Date(currTime.getTime());
    timeRefreshHandle = setInterval(function () {
      currTime = new Date();
      if (currTime.getTime() > endTime.getTime()) {
        currTimeStr = currTime.getHours() + ':' + currTime.getMinutes() + ':' + currTime.getSeconds();
        $('#time-display').text(currTimeStr);
        $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
        endTime = new Date(currTime.getTime());;
      }
    }, 500);
    
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
    
    $('#increment-endtime').click( function (e) {
      e.preventDefault();
      leggo.changeEndTime(5);
      if (timeSetHandle !== null) {
        clearTimeout(timeSetHandle);
      }
      timeSetHandle = setTimeout(function () {
        leggo.findActivities();
      }, 500);
    });
    $('#decrement-endtime').click( function (e) {
      e.preventDefault();
      leggo.changeEndTime(-5);
      if (timeSetHandle !== null) {
        clearTimeout(timeSetHandle);
      }
      timeSetHandle = setTimeout(function () {
        leggo.findActivities();
      }, 500);
    });
    
    // hand = $('#hours-hand');
    // offsets = hand.offset();
    // handCenter = [ offsets.left + hand.width()/2, offsets.top + hand.height() ];
    // console.log(offsets.left);
    // $('#clock-wrapper').mousedown(function (e) {
      // isMouseDown = true;
      // setClock(e);
    // })
    // .mousemove(function (e) {
      // if (true) {
        // setClock(e);
      // }
    // })
    // .mouseup(function (e) {
      // isMouseDown = false
    // });
    

    leggo.findActivities();
    activityRefreshHandle = setInterval(leggo.findActivities, 300000);
    
  }
  
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
  
  function setClock (e) {
    var x = e.pageX;
    var y = e.pageY;
    
    var hand = $('#hours-hand');
    var clock = $('#clock');
    var offsets = clock.offset();
    var handCenter = [ offsets.left + clock.width()/2, offsets.top + clock.height()/2 ];
    console.log(handCenter);
    // var left = (x - offsets.left)
    // var top = ((offsets.top + $('#hours-hand').height()) - y)
    var angle = -1*Math.atan2(x - handCenter[0], y - handCenter[1])*(180/Math.PI);
    console.log(angle);
    
    $('#hours-hand').css('-webkit-transform','rotate('+angle+'deg)');
    
    console.log('mouseX: ' + x + ' mouseY: ' + y);
    console.log('rectX: ' + handCenter[0] + ' rectY: ' + handCenter[1]);
    // element.style.webkitTransform = "rotate(" + rad + "rad)";
  }
  
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(storePosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }
  
  function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
  }
  
  leggo.changeEndTime = function changeEndTime(amount) {
    endTime = addMinutes(endTime, amount);
    if ( endTime.getTime() < currTime.getTime() ) {
      currTimeStr = currTime.getHours() + ':' + currTime.getMinutes() + ':' + currTime.getSeconds();
      $('#time-display').text(currTimeStr);
      // $('#time-display').attr('filterValue', currTime.getHours() + currTime.getMinutes()/60);
      $('#time-display').attr('filterValue', currTime.toDateString() + ' ' + currTime.toTimeString());
    } else {
      endTimeStr = endTime.getHours() + ':' + endTime.getMinutes() + ':' + endTime.getSeconds();
      $('#time-display').text(endTimeStr);
      // $('#time-display').attr('filterValue', endTime.getHours() + endTime.getMinutes()/60);
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
  
    // x.innerHTML="Latitude: " + position.coords.latitude + 
    // "<br>Longitude: " + position.coords.longitude;	
  }
  
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
  
  leggo.findActivities = function () {
    currTime = new Date();    
    var startTime = currTime.getHours() + currTime.getMinutes()/60;
    
    var someData = {
      'coords': [ latitude, longitude ],
      'starttime': currTime.toDateString() + ' ' + currTime.toTimeString()
    };
    
    $('.image-checkbox-checked').each(function (i, n) {
      someData[$(this).attr('filter')] = someData[$(this).attr('filter')] || [];
      someData[$(this).attr('filter')].push($(this).attr('filtervalue'));
      console.log('filter: ' + $(this).attr('filter') + ' value: ' + $(this).attr('filtervalue'));
    });
  
    $.post('/findactivities', someData, function (data) {
      activityData = data['activities'];
      populateActivities(activityData);
      
      console.log(data);
    });
  }
  
  function populateActivities (activities) {
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