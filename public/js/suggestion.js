(function (window, suggestion, $, undefined) {

  var lastSlideIndex = 7;

  suggestion.initializePage = function () {
    console.log('started!');
    var slides = $('.swipe-wrap').children();
    var elem = document.getElementById('slider');
    window.mySwipe = Swipe(elem, {
      startSlide: 0,
      speed: 300,
      auto: 0,
      continuous: false,
      disableScroll: false,
      stopPropagation: false,
      callback: function(index, elem) {
        console.log("index is now "+ index);
        if (lastSlideIndex === index) {
          mySwipe.prev();
        }
      },
      transitionEnd: function(index, elem) {}
    });
    
    $('#name-input').focus(clearText);
    $('#description-input').focus(clearText);
    $('#location-input').focus(clearText);
    $('#things-input').focus(clearText);
  };
  
  suggestion.submit = function () {
    var name = $('#name-input').val() || '';
    var description = $('#description-input').val() || '';
    var location = $('#location-input').val() || '';
    var things = $('#things-input').val() || '';
    var energy = $('#energy-input').val() || '';
    var length = $('#length-input').val() || '';
    
    var startHours = parseInt($('#start-hours-input').find(':selected').val());
    var startMinutes = parseInt($('#start-minutes-input').find(':selected').val());
    var startAMPM = parseInt($('#start-ampm-input').find(':selected').val());
    
    var endHours = parseInt($('#end-hours-input').find(':selected').val());
    var endMinutes = parseInt($('#end-minutes-input').find(':selected').val());
    var endAMPM = parseInt($('#end-ampm-input').find(':selected').val());
    
    var submission = {
      name: name,
      description: description,
      location: location,
      things: things,
      energy: energy,
      length: length,
      starttime: (startHours + startAMPM*12 + startMinutes/60),
      endtime: (endHours + endAMPM*12 + endMinutes/60)
    };
    
    $('#submit-suggestion-button').text('Loading...');
    $.post('/submitsuggestion', submission, function (data, textStatus, jqXHR) {
      window.location.href = '/';
      // console.log(data);
      // if (data.response === 'success') {
        // window.location.href = '/';
      // } else {
        // $('#submit-suggestion-button').text('ERROR!');
        // setTimeout(function () {$('#submit-suggestion-button').text('SUBMIT');}, 3000);
      // }
    });
  };
  
  function clearText () {
    $(this).val('');
  }

})(this, window.suggestion = window.suggestion || {}, jQuery);