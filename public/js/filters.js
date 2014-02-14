(function (window, leggo, $, undefined) {

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
    
    
    // var allCheckboxDivs = document.getElementsByClassName("image-checkbox");
    // for (var i=0;i<allCheckboxDivs.length;i++) {
      // $(allCheckboxDivs[i]).unbind('click').click(function (e) {
          // e.preventDefault();
          // var divID = this.id;
          // var checkboxID =divID.split("_")[0];
          // var checkboxElement = document.getElementById(checkboxID);

          // if (checkboxElement.checked == true) {
              // checkboxElement.checked = false;
              // $(this).removeClass('image-checkbox-checked');
              // $(this).addClass('image-checkbox');
          // } else {
              // checkboxElement.checked = true;
              // $(this).removeClass('image-checkbox');
              // $(this).addClass('image-checkbox-checked');
          // }
      // });
    // }
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
    var someData = {};
    
    $('.image-checkbox-checked').each(function (i, n) {
      
      
      
    });
  
    //$.post('someurl', someData);
  }

})(this, window.leggo = window.leggo || {}, jQuery);