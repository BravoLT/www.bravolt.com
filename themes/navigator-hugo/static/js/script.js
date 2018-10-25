(function ($) { "use strict";
	/* ========================================================================= */
	/*	Page Preloader
	/* ========================================================================= */

	$(window).on("load",function(){
		$('#preloader').fadeOut('slow',function(){$(this).remove();});
	});

	/* ========================================================================= */
	/*	Portfolio Filtering Hook
	/* =========================================================================  */
	$('.play-icon i').click(function() {
		var video = '<iframe allowfullscreen src="' + $(this).attr('data-video') + '"></iframe>';
		$(this).replaceWith(video);
	});

	/* ========================================================================= */
	/*	Portfolio Filtering Hook
	/* =========================================================================  */

	var portfolio_item = $('.portfolio-items-wrapper');
	if (portfolio_item.length) {
		var mixer = mixitup(portfolio_item);
	};


	/* ========================================================================= */
	/*	Testimonial Carousel
	/* =========================================================================  */

	//Init the slider
	$('.testimonial-slider').slick({
		slidesToShow: 2,
		slidesToScroll: 1,
		infinite: true,
		arrows:false,
		autoplay: true,
  		autoplaySpeed: 2000,
  		responsive: [
		    {
		      breakpoint: 600,
		      settings: {
		        slidesToShow: 1,
		        slidesToScroll: 2
		      }
		    },
		    {
		      breakpoint: 480,
		      settings: {
		        slidesToShow: 1,
		        slidesToScroll: 1
		      }
		    }
		  ]
	});


	/* ========================================================================= */
	/*	Clients Slider Carousel
	/* =========================================================================  */

	//Init the slider
	$('.clients-logo-slider').slick({
		infinite: true,
		arrows:false,
		autoplay: true,
  		autoplaySpeed: 2000,
  		slidesToShow: 5,
  		slidesToScroll: 1,
	});




	/* ========================================================================= */
	/*	Company Slider Carousel
	/* =========================================================================  */
	$('.company-gallery').slick({
		infinite: true,
		arrows:false,
		autoplay: true,
  		autoplaySpeed: 2000,
  		slidesToShow: 5,
  		slidesToScroll: 1,
	});


	/* ========================================================================= */
	/*	Awars Counter Js
	/* =========================================================================  */
	$('.counter').each(function() {
		var $this = $(this),
		countTo = $this.attr('data-count');
		$({ countNum: $this.text()}).animate({
			countNum: countTo
		},
		{
			duration: 1500,
			easing:'linear',
			step: function() {
				$this.text(Math.floor(this.countNum));
			},
			complete: function() {
				$this.text(this.countNum);
			}
		});

	});

	/* ========================================================================= */
	/*   Contact Form Validating
	/* ========================================================================= */

	$('#resumeUpload').on('change', function(e) {
		var fileName = e.target.value.split('\\').pop();
		if (fileName) {
			$("#resumeUpload + label + .resume-name").html(fileName);
		}
	});

	$('#contact-submit').click(function (e) {
		e.preventDefault();

		var error = check_for_empty_inputs("#name, #email, #subject, #message");

		if (error == false) {
			$('#contact-submit').attr({
				'disabled': 'false',
				'value': 'Sending...'
			});

			var subject = $("#name").val() + ": " + $("#subject").val();
			var body = $("#message").val() + "\n\n" + "Email back at: " + $("#email").val();
			aws_send_email(subject, body).then(() => $("#contact-submit").attr({
				'value': 'Sent!',
				'disabled': ''
			}));
		}
	});

	/* ========================================================================= */
	/*	On scroll fade/bounce effect
	/* ========================================================================= */
	var scroll = new SmoothScroll('a[href*="#"]');

	/* ========================================================================= */
	/*	Header Scroll Background Change
	/* ========================================================================= */

	$(window).scroll(function() {
	var scroll = $(window).scrollTop();
	if (scroll > 200) {
		$(".navigation").addClass("sticky-header");
	} else {
		$(".navigation").removeClass("sticky-header");
	}});

})(jQuery);



window.marker = null;

function initialize() {
    var map;

	var latitude = $('#map').data('lat');
	var longitude = $('#map').data('long');
    var nottingham = new google.maps.LatLng(latitude, longitude);

    var style = [
    	{"stylers": [{"hue": "#ff61a6"},{"visibility": "on"},{"invert_lightness": true},{"saturation": 40},{"lightness": 10}]}
	];

    var mapOptions = {
        // SET THE CENTER
        center: nottingham,

        // SET THE MAP STYLE & ZOOM LEVEL
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom:9,

        // SET THE BACKGROUND COLOUR
        backgroundColor:"#000",

        // REMOVE ALL THE CONTROLS EXCEPT ZOOM
        zoom:17,
        panControl:false,
        zoomControl:true,
        mapTypeControl:false,
        scaleControl:false,
        streetViewControl:false,
        overviewMapControl:false,
        zoomControlOptions: {
            style:google.maps.ZoomControlStyle.LARGE
        }

    }
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // SET THE MAP TYPE
    var mapType = new google.maps.StyledMapType(style, {name:"Grayscale"});
    map.mapTypes.set('grey', mapType);
    map.setMapTypeId('grey');

    //CREATE A CUSTOM PIN ICON
    var marker_image = $('#map').data('marker');
    var pinIcon = new google.maps.MarkerImage(marker_image,null,null, null,new google.maps.Size(25, 33));

    marker = new google.maps.Marker({
        position: nottingham,
        map: map,
        icon: pinIcon,
        title: 'navigator'
    });
}

var map = $('#map');
if(map.length != 0){
    google.maps.event.addDomListener(window, 'load', initialize);
}

function aws_send_email (subject, body, resume) {
	return fetch('https://fwykqh9xdb.execute-api.us-west-2.amazonaws.com/production/bravolt-send-mail', {
	  method: 'POST',
	  headers: {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify({ subject, body, resume })
	})
}

function check_for_empty_inputs(queryString) {
	var inputList = jQuery(queryString);
	var error = false;

	for (var i = 0; i < inputList.length; i++) {
		if (inputList[i].value.length == 0) {
			error = true;
			$(inputList[i]).addClass("error");
		} else {
			$(inputList[i]).removeClass("error");
		}
	}

	return error;
}

function file_to_base64_string (file) {
	return new Promise(function (resolve, reject) {
		var fr = new FileReader();
		fr.onload = function() { 
			resolve(fr.result);
		}
		fr.onerror = function(error) {
			alert("Could not read file, try again");
			resolve(null);
		}
		fr.readAsDataURL(file);
	});
}