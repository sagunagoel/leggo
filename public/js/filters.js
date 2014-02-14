(function (window, leggo, $, undefined) {

  leggo.initializePage = function () {
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
    
    // $.get('../../data.json', function (data) {
    //   console.log(data);
    // });
    
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