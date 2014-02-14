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
    
    
    var allCheckboxDivs = document.getElementsByClassName("image-checkbox");
    for (var i=0;i<allCheckboxDivs.length;i++) {
      $(allCheckboxDivs[i]).unbind('click').click(function (e) {
          e.preventDefault();
          var divID = this.id;
          var checkboxID =divID.split("_")[0];
          var checkboxElement = document.getElementById(checkboxID);

          if (checkboxElement.checked == true) {
              checkboxElement.checked = false;
              $(this).removeClass('image-checkbox-checked');
              $(this).addClass('image-checkbox');
          } else {
              checkboxElement.checked = true;
              $(this).removeClass('image-checkbox');
              $(this).addClass('image-checkbox-checked');
          }
      });
    }
  }
  
  leggo.changeFilter = function changeFilter (isNext) {
    var currPos = mySwipe.getPos();
    console.log(currPos);
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
    
    
  
    //$.post('someurl', someData);
  }

})(this, window.leggo = window.leggo || {}, jQuery);