(function (window, leggo, $, undefined) {

  var longitude = null;
  var latitude = null;
  var locationRefreshInterval = null;
  var timeRefreshInterval = null;
  
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
    

    getLocation();
    locationRefreshInterval = setInterval(getLocation, 60000);
    
    // set up time filter
    currTime = new Date();
    $('#time-display').text(currTime.getHours() + ':' + currTime.getMinutes() + ':' + currTime.getSeconds());
    $('#time-display').attr('filterValue', currTime.getHours() + currTime.getMinutes()/60);
    endTime = new Date(currTime.getTime());
    timeRefreshInterval = setInterval(function () {
      currTime = new Date();
      if (currTime.getTime() > endTime.getTime()) {
        currTimeStr = currTime.getHours() + ':' + currTime.getMinutes() + ':' + currTime.getSeconds();
        $('#time-display').text(currTimeStr);
        $('#time-display').attr('filterValue', currTime.getHours() + currTime.getMinutes()/60);
        endTime = new Date(currTime.getTime());;
      }
    }, 500);
    
    //enable filter buttons
    $('.image-checkbox').each(function (i, n) {
      $(this).click( function (e) {
        e.preventDefault();
        var button = $(this);
        if (button.hasClass('image-checkbox-checked')) {
          button.removeClass('image-checkbox-checked');
          button.addClass('image-checkbox');
        } else {
          button.removeClass('image-checkbox');
          button.siblings('.image-checkbox-checked').removeClass('image-checkbox-checked');
          button.addClass('image-checkbox-checked');
        }
        leggo.findActivities();
        leggo.changeFilter(true);
      });
    });
    
    $('.surprise-button').each(function (i, n) {
      $(this).click( function (e) {
        e.preventDefault();
        var buttons = $(this).parent().parent().find('.icons').children().removeClass('image-checkbox-checked').addClass('image-checkbox');
        leggo.changeFilter(true);
      });
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
      $('#time-display').attr('filterValue', currTime.getHours() + currTime.getMinutes()/60);
    } else {
      endTimeStr = endTime.getHours() + ':' + endTime.getMinutes() + ':' + endTime.getSeconds();
      $('#time-display').text(endTimeStr);
      $('#time-display').attr('filterValue', endTime.getHours() + endTime.getMinutes()/60);
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
      'starttime': startTime
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