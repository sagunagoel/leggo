(function (window, leggo, $, undefined) {

  var longitude = null;
  var latitude = null;
  var locationRefreshInterval = null;
  
  var activityData = {};

  leggo.initializePage = function () {
    var x=document.getElementById("demo");
    // pure JS
    var currId;


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
    
    $('.image-checkbox').each(function (i, n) {
      $(this).click( function (e) {
        e.preventDefault();
        var thisjQuery = $(this);
        if (thisjQuery.hasClass('image-checkbox-checked')) {
          thisjQuery.removeClass('image-checkbox-checked');
          thisjQuery.addClass('image-checkbox');
        } else {
          thisjQuery.removeClass('image-checkbox');
          thisjQuery.addClass('image-checkbox-checked');
        }
      });
    });
  }
  
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(storePosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
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
    var currTime = new Date();    
    var startTime = currTime.getHours() + currTime.getMinutes()/60;
    var someData = {
      'coords': [ latitude, longitude ],
      'starttime': startTime
    };
    
    $('.image-checkbox-checked').each(function (i, n) {
      someData[$(this).attr('filter')] = someData[$(this).attr('filter')] || [];
      someData[$(this).attr('filter')].push($(this).attr('filtervalue'));
    });
    
    console.log(someData);
  
    $.post('/findactivities', someData, function (data) {
      activityData = data['activities'];
      //populate activities page!
      
      console.log(data);
    });
  }

})(this, window.leggo = window.leggo || {}, jQuery);