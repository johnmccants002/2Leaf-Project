// $(function() {
//     $('#slideshow img:gt(0)').hide();
//     setInterval(function() {
//     $('.bannerimage')
//     .fadeOut(5000)
//     .next('img')
//     .fadeIn(1000)
//     .end()
//     .appendTo('#slideshow');
//     }, 4000);
//     });'

$(document).ready(function(){
    var slide_count = $(".carousel li").length;
    var slide_width = $("body").width();
    var slide_height = $(".carousel li").height();
    var cont_width = slide_width;
    
    $(".cont").css({ height: slide_height, width: slide_width});
    $(".carousel").css({ width: cont_width * 2, marginLeft: - slide_width });
    $(".carousel li:last-child").prependTo(".carousel");
    
    function next_slide(){
      $(".carousel").animate({
        left: + slide_width
      }, 1000, function(){
        $(".carousel li:last-child").prependTo(".carousel");
        $('.carousel').css('left', 0);
      }
      );
    }
    
    function prev_slide(){
      $(".carousel").animate({
        left: - slide_width
      }, 400, function(){
        $(".carousel li:first-child").appendTo(".carousel");
        $(".carousel").css("left", 0);
      }
      );
    }
    
    $("#next").click(function(){
      next_slide();
    });
    $("#prev").click(function(){
      prev_slide();
    });

    var SECONDS_INTERVAL = 5000; // 1s
var mouseHoverFlag = false;

setInterval(function() {
    if (!mouseHoverFlag) {
        next_slide();
    }
}, SECONDS_INTERVAL);

    
  });


