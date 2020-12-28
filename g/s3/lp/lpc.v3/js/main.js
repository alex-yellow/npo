;(function(){
	var $win = $(window),
		$doc = $(document),
		$body = $('body'),
		lpc_template = {};
		
	window.lpc_template = lpc_template;

	lpc_template.queue = {};

	lpc_template.adaptiveBlock = function() {
		var $block = $body.find('.lpc-block');
		
		if (!$block.length) { return; }
		
		
		var $firstBlock = $block.filter(function(){
			return !$(this).closest('._hide-block').length;
		}).eq(0),
			firstBlockWidth = $firstBlock.width(),
			firstBlockType = $firstBlock.data("media-source");
			
		if (firstBlockWidth < 768 && lpc_template.deviceType != "mobile") {
			lpc_template.deviceType = "mobile";
			$block.attr("data-media-source", "mobile");
			$doc.trigger('checkDeviceType', [lpc_template.deviceType]);
		} else if (firstBlockWidth < 1024 && firstBlockWidth >= 768 && lpc_template.deviceType != "tablet"){
			lpc_template.deviceType = "tablet";
			$block.attr("data-media-source", "tablet");
			$doc.trigger('checkDeviceType', [lpc_template.deviceType]);
		} else if (firstBlockWidth >= 1024 && lpc_template.deviceType != "desktop") {
			lpc_template.deviceType = "desktop";
			$block.attr("data-media-source", "desktop");
			$doc.trigger('checkDeviceType', [lpc_template.deviceType]);
		}
		
		$block.each(function(){
			var $thisSimpleCols = Array.from(this.querySelectorAll('._simple-col'));
			
			if (!$thisSimpleCols.length) return;
			
			var $thisSimpleColsItems = $thisSimpleCols.reduce((acc, item) => [...acc, item.children], []);

			for (let i = 0; i < $thisSimpleColsItems[0].length; i++) {
				var minHeight = 0
				$thisSimpleColsItems.forEach(function(elem) {
					if (!elem[i]) return;
					var $item = elem[i].querySelector('._title');
					
					$($item).css('min-height', 0);
					
					if (lpc_template.deviceType === "mobile") return;
					
					var	elemHeight = $item.offsetHeight;
					
					minHeight = minHeight > elemHeight ? minHeight : elemHeight;
				});
				
				$thisSimpleColsItems.forEach((elem) => {
					if (!elem[i]) return;
					$(elem[i].querySelector('._title')).css('min-height', minHeight)
				});
			}
		});
	}
	
	lpc_template.initMaps = function(options) {
		var map;
		
		if (options.type === "google") {
			map = new google.maps.Map(document.getElementById(options.id), {
				zoom: parseInt(options.zoom),
				scrollwheel: false,
				center: new google.maps.LatLng(options.center[0], options.center[1])
			});

			$.each(options.data, function(key, item) {
			
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(item.coords[0], item.coords[1]),
					map: map,
					title: item.name
				});

				var infowindow = new google.maps.InfoWindow({
					content: '<div class="baloon-content">' +
						'<h3 style="margin: 0; padding-bottom: 3px;">' + item.name + '</h3>' +
						item.desc +
						'</div>'
				});

				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map, marker);
				});
				
				
			});
		
		} else {
			ymaps.ready(function() {
				map = new ymaps.Map(options.id, {
					center: options.center,
					zoom: options.zoom,
					behaviors: ['drag', 'rightMouseButtonMagnifier'],
				});

				map.controls.add(
					new ymaps.control.ZoomControl()
				);

				var MyBalloonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
					'<div class="baloon-content" style="padding: 0 10px;">' +
					'<h3 style="margin: 0;">$[properties.name]</h3>' +
					'<p>$[properties.desc]</p>' +
					'</div>'
				);

				var myCollection = new ymaps.GeoObjectCollection();

				$.each(options.data, function(key, item) {
					myCollection.add(new ymaps.Placemark(
						item.coords,
						item, {
							balloonContentLayout: MyBalloonContentLayoutClass
						}
					));
				});

				map.geoObjects.add(myCollection);
				
				$('#' + options.id).data('ymaps', map);
				
				$doc.on('checkDeviceType', function(e, param) {
					map.container.fitToViewport();
				});
			});
		}
	}
	
	lpc_template.queue.lpcTimer = function($self) {
		var $block = $self.find('.js-lp-timer'),
			htmlLang = document.documentElement.lang,
			timerDays, timerHours, timerMinutes, timerSeconds, formatOut;
		
		if (htmlLang == 'de' || htmlLang == 'en') {
			timerDays = 'days';
			timerHours = 'hours';
			timerMinutes = 'minutes';
			timerSeconds = 'seconds'
	    } else {
			timerDays = 'Дней';
			timerHours = 'Часов';
			timerMinutes = 'Минут';
			timerSeconds = 'Секунд'
	    }
	    
	    var formatOut = '<div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">%d</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerDays + '</div></div><div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">%h</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerHours + '</div></div><div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">%m</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerMinutes + '</div></div><div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">%s</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerSeconds +'</div></div>';
	    var formatEnd = '<div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">00</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerDays + '</div></div><div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">00</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerHours + '</div></div><div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">00</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerMinutes + '</div></div><div class="lp-ui-timer__item"><div class="lp-ui-timer__item-number" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-number">00</div><div class="lp-ui-timer__item-text lp-header-text-4" data-elem-type="text" data-lp-selector=".lp-ui-timer__item-text">' + timerSeconds +'</div></div>';
	    
	    
		
		if ($block.length) {
			$block.each(function(){
				var $this = $(this);
				
				$this.timer({
					format_in: "%d.%M.%y %h:%m:%s",
					language: htmlLang,
					update_time: s3LP.is_cms ? 100000 : 1000,
					format_out: formatOut,
					onEnd: function(){
						$this.html(formatEnd);
					}
				})
			});	
		}
	}
	
	lpc_template.queue.formInputs = function($self) {		
		
		$doc.on('click', '.js-select, .js-multi_select', function() {
			var $this = $(this),
				openedClass = '_opened',
				$thisParent = $this.closest('.lp-form-tpl__field-select, .lp-form-tpl__field-multi_select'),
				$thisList = $thisParent.find('.lp-form-tpl__field-select__list, .lp-form-tpl__field-multi_select__list');
				
			if ($thisParent.hasClass(openedClass)) {
				$thisParent.removeClass(openedClass);
				$thisList.slideUp();
			} else {
				$thisParent.addClass(openedClass);
				$thisList.slideDown();
			}
		});
		
		$doc.on('click', '.js-choose-select', function() {
			var $this = $(this),
				thisText = $this.text(),
				$thisParent = $this.closest('.lp-form-tpl__field-select'),
				checkedClass = '_checked';
				
			if (!$this.hasClass(checkedClass)) {
				$thisParent.find('.js-choose-select').removeClass(checkedClass);
				$this.addClass(checkedClass);
				$thisParent.find('.lp-form-tpl__field-select__input').text(thisText);
				$thisParent.parent().find('input').val(thisText);
			}
			
			$thisParent.find('.lp-form-tpl__field-select__list').slideUp();
			$thisParent.removeClass('_opened');
				
		});
		
		$doc.on('click', '.js-choose-milti_select', function() {
			var $this = $(this),
				$thisParent = $this.closest('.lp-form-tpl__field-multi_select'),
				checkedClass = '_checked';
				
			if (!$this.hasClass(checkedClass)) {
				$this.addClass(checkedClass);
			} else {
				$this.removeClass(checkedClass);
			}
			
			var choosenElements = $thisParent.find('.' + checkedClass),
				choosenElementsText = [];
				
			choosenElements.each(function() {
				choosenElementsText.push($(this).text());
			});
				
			$thisParent.find('.lp-form-tpl__field-multi_select__input--count').text(choosenElements.length);
			$thisParent.parent().find('input').val(choosenElementsText.join(', '));
		});
		
		
		
		$doc.on('click', function(e) {
			if ($(e.target).closest('.lp-form-tpl__field-select, .lp-form-tpl__field-multi_select').length) return;
			
			$doc.find('.lp-form-tpl__field-select, .lp-form-tpl__field-multi_select').removeClass('_opened');
			
			$doc.find('.lp-form-tpl__field-select__list, .lp-form-tpl__field-multi_select__list').slideUp();
		});
	}
	
	lpc_template.queue.calendar = function($self) {
		$doc.on('click', '.js-form-calendar', function() {
			var $this = $(this),
				thisCalendarInited = $this.data('calendarInited');
				
			if (!thisCalendarInited) {
				$this.datepicker();
				thisCalendarInited = $this.data('calendarInited', true);
			}
		});
		
		$doc.on('click', '.js-form-calendar-interval', function() {
			var $this = $(this),
				thisCalendarInited = $this.data('calendarInited');
				
			if (!thisCalendarInited) {
				$this.datepicker({
					range: true
				});
				thisCalendarInited = $this.data('calendarInited', true);
			}
		});
	}
	
	lpc_template.queue.lpcSimpleMap = function($self) {
		var $block = $self.find('.js-lpc-simple-map');
		
		if ($block.length) {
			$block.each(function(){
				var $this = $(this),
					thisParams = $this.data('init-params');
					
				if (typeof thisParams.center === 'string') {
					thisParams.center = thisParams.center.split(',');
				}
				
				$.each(thisParams.data, function(key, item) {
					if (typeof item.coords === 'string') {
						item.coords = item.coords.split(',');
					}
				});
				
				setTimeout(function(){
					lpc_template.initMaps(thisParams);
				}, 1000)
			});
		}
	}
	
	lpc_template.queue.lpcSimpleAccordeon = function($self) {
		var $block = $self.find('.js_accordeon_title'),
			activeClass = 'active';
		
		if ($block.length) {
			$block.on('click', function(e) {
				e.preventDefault();
				
				var $this = $(this),
					$ymap = $this.closest('[data-block-layout]').find('.js-lpc-simple-map');
					$thisParent = $this.closest('._parent'),
					$thisBody = $thisParent.find('._content');
					
				if ($thisParent.hasClass(activeClass)) {
					$thisBody.slideUp(400, function(){
						$thisParent.removeClass(activeClass);
						if ($ymap.length && $ymap.data('ymaps')) {
							$ymap.data('ymaps').container.fitToViewport();
						}
					});
				} else {
					$thisBody.slideDown(400, function(){
						$thisParent.addClass(activeClass);
						if ($ymap.length && $ymap.data('ymaps')) {
							$ymap.data('ymaps').container.fitToViewport();
						}
					});
				}
			});
		}
	}
	
	lpc_template.queue.lpcSimpleSlider = function($self) {
		var $slider = $self.find('.js-lpc-simple-slider');

		if ($slider.length) {
			$slider.each(function() {
				var $this = $(this),
					isOnlyMobile = !!$this.data('mobile-slider'),
					parentSelector = $this.data('parent') ? $this.data('parent') : '[data-block-layout]',
					$parent = $this.closest(parentSelector),
					$items = $this.find('._item-slide'),
					count = $this.data('count'),
					margin = $this.data('margin'),
					infinite = !!$this.data('infinite'),
					autoplay = !!$this.data('autoplay'),
					pause = $this.data('pause'),
					speed = $this.data('speed'),
					center = !!$this.data('center'),
					autoWidth = !!$this.data('auto-width'),
					$nav = $parent.find('.js-simple-slider-nav'),
					$dots = $parent.find('.js-simple-slider-dots');

				$doc.on('checkDeviceType', function(e, param) {
				
					$this.trigger('destroy.owl.carousel');
					
					if (isOnlyMobile && param !== 'mobile') {
						return;
					}
					
					var thisCount = param === 'mobile' ? count[2] : param === 'tablet' ? count[1] : count[0];
					var thisMargin = param === 'mobile' ? margin[2] : param === 'tablet' ? margin[1] : margin[0];

					var isInfinite = $items < thisCount ? false : infinite;

					$this.owlCarousel({
						items: thisCount,
						margin: thisMargin,
						autoplay : autoplay,
						loop : isInfinite,
						nav : false,
						dots : true,
						autoWidth: autoWidth,
						center: center,
						smartSpeed: speed,
						mouseDrag: s3LP.is_cms ? false : true, 
						autoplayTimeout: pause,
						onInitialized: function() {
							if ($dots.length) {
								var dotsLength = $parent.find('.owl-dots > *').length;
								if (dotsLength < 2) {
									$dots.html('');
								} else {
									var dotItems = '',
										dotClass = $dots.data('dot-class');
									
									for (let i = 0; i < dotsLength; i++) {
										dotItems += '<div class="lpc-simple-dot-item ' + dotClass +'" data-elem-type="container" data-lp-selector=".lpc-simple-dot-item"></div>'
									}
									
									$dots.html(dotItems);
									$dots.find('.lpc-simple-dot-item').eq(2).addClass('active');
								}
							}
						},
						onTranslated: function(e) {
							$dots.find('.lpc-simple-dot-item').removeClass('active').eq(e.page.index).addClass('active');
						}
					})
				});
				
				if ($nav.length) {
					$nav.on('click', '.js-prev-slide', function(e) {
						e.preventDefault();
						$this.trigger('prev.owl.carousel');
					});
					
					$nav.on('click', '.js-next-slide', function(e) {
						e.preventDefault();
						$this.trigger('next.owl.carousel');
					});
				}
				
				$dots.on('click', '.lpc-simple-dot-item', function(e) {
					$this.trigger('to.owl.carousel', [$(this).index()]);
				});
			});
		}
	}
	
	lpc_template.queue.lpcCarousel1 = function($self) {

		var $block = $self.find('.js-carousels-1');

		if ($block.length) {
			$block.each(function(){
				var $this = $(this),
					$items = $this.find('.lpc-carousels-1__item'),
					carouselSpeed = $this.data('speed'),
					$parent = $this.closest('[data-block-layout]'),
					$nav = $parent.find('.js-simple-slider-nav'),
					$dots = $parent.find('.js-simple-slider-dots');
				
				$doc.on('checkDeviceType', function(e, param) {
					
					$this.trigger('destroy.owl.carousel');

					$this.owlCarousel({
						items: 1,
						loop: true,
						startPosition: 2,
						autoplay : false,
						mouseDrag: param === 'mobile' ? true : false,
						touchDrag: param === 'mobile' ? true : false,
						pullDrag: false,
						smartSpeed: carouselSpeed,
						nav: false,
						dots : true,
						margin: 0,
						onTranslated: function(e){
							$dots.find('.lpc-simple-dot-item').removeClass('active').eq(e.page.index).addClass('active');
						},
						onInitialized: function(e){
							addClasses($this, $parent);
							
							if ($dots.length) {
								var dotsLength = $parent.find('.owl-dots > *').length;
								if (dotsLength < 2) {
									$dots.html('');
								} else {
									var dotItems = '',
										dotClass = $dots.data('dot-class');
									
									for (let i = 0; i < dotsLength; i++) {
										dotItems += '<div class="lpc-simple-dot-item ' + dotClass +'" data-elem-type="container" data-lp-selector=".lpc-simple-dot-item"></div>'
									}
									
									$dots.html(dotItems);
									$dots.find('.lpc-simple-dot-item').eq(0).addClass('active');
								}
							}
						}
					});
				
				});
				
				$nav.on('click', '.js-lpc-carousels-1-prev-slide', function(e){
					e.preventDefault();
					$this.trigger('prev.owl.carousel');
					removeClasses($this);
					addClasses($this, $parent);
				});
				
				$nav.on('click', '.js-lpc-carousels-1-next-slide', function(e){
					e.preventDefault();
					$this.trigger('next.owl.carousel');
					removeClasses($this);
					addClasses($this, $parent);
				});
				
				$this.on('click', '.prev-1 > div', function(e) {
					e.preventDefault();
					$this.trigger('prev.owl.carousel');
					removeClasses($this);
					addClasses($this, $parent);
				});
				
				$this.on('click', '.next-1 > div', function(e) {
					e.preventDefault();
					$this.trigger('next.owl.carousel');
					removeClasses($this);
					addClasses($this, $parent);
				});
				
				$dots.on('click', '.lpc-simple-dot-item', function(e) {
					var $newDot = $(this),
						$owlItems = $this.find('.owl-item'),
						newIndex = $newDot.index(),
						oldIndex = $newDot.parent().find('.active').index(),
						scrolledItems = (newIndex - oldIndex) * carouselSpeed;
				
					$this.trigger('to.owl.carousel', [$(this).index()]);
				
					removeClasses($this);
				
					if (oldIndex < newIndex) {
						$owlItems.addClass('movingLeft');
					} else if (oldIndex > newIndex) {
						$owlItems.addClass('movingRight');
						scrolledItems *= -1;
					}
				
					if (scrolledItems > 1500) {
						scrolledItems = 1500;
					}
				
					setTimeout(function() {
						addClasses($this, $parent);
					}, scrolledItems);
				
					setTimeout(function () {
						$owlItems.removeClass('movingLeft movingRight');
					}, scrolledItems);
				});

			});
		}
	
	    function addClasses($slider, $parent) {
			if ($parent.width() >= 1024) {
				$slider.find('.owl-item.active').next().addClass('next-1').next().addClass('next-2').next().addClass('next-3');
				$slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2').prev().addClass('prev-3');
				$slider.find('.next-1 .lpc-carousels-2__item, .prev-1 .lpc-carousels-2__item').attr("data-has-event", "1");
			} else if ($parent.width() >= 768) {
				$slider.find('.owl-item.active').next().addClass('next-1').attr("data-has-event", "1").next().addClass('next-2');
				$slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2');
			}
	    }
	
		function removeClasses($slider) {
			$slider.find('.owl-item').removeClass('next-1 next-2 next-3 prev-1 prev-2 prev-3');
		}
	}
	
	lpc_template.queue.lpcSimpleColumn = function($self) {
		var $block = $self.find('.js-lpc-simple-colum');
		
		if ($block.length) {
			$block.each(function(){
				var $this = $(this),
					$items = $this.find('._parent');
					countArray = $this.data('column-count');
					
				$doc.on('checkDeviceType', function(e, param) {
					var thisCount = param === 'mobile' ? countArray[2] : param === 'tablet' ? countArray[1] : countArray[0];
					
					unwrap($items);
					
					if (thisCount == 1) {
						$items.wrap('<div class="_simple-col"></div>');
						return;
					}
					
					var itemsLengthInColumn = Math.round($items.length / thisCount);
					
					for (let i = 1; i < thisCount + 1; i += 1) {
						$items.filter(function (index) {
							return index >= (i - 1) * itemsLengthInColumn && index < i * itemsLengthInColumn;
						}).wrapAll('<div class="_simple-col"></div>');
					}
				});
			});
			
			function unwrap ($list) {
				$list.each(function() {
					if (!this.parentNode.classList.contains("_simple-col")) return;
					$(this).unwrap();
				});
			}
		}
	}
	
	lpc_template.queue.lpcVideo6 = function($self) {

		var $block = $self.hasClass('lpc-video-6') ? $self : $self.find('.lpc-video-6');
	
		if ($block.length) {
			$(document).on('checkDeviceType', function(e, param) {
				$block.each(function(){
					var $this = $(this),
						slider_big = $this.find('.lpc-video-6__slider-big'),
						slider_thumbs = $this.find('.lpc-video-6__slider-thumbs'),
						$controls = $this.find('.lpc-video-6__thumbs-controls'),
						$dots = $this.find('.lpc-video-6__thumbs-dots'),
						$nav = !!slider_thumbs.data('arrows'),
						$dot = !!slider_thumbs.data('dots'),
						autoplay = $this.data('autoplay'),
						pause = $this.data('pause'),
						speed = $this.data('speed'),
						infinite = $this.data('infinite');
	
					if (slider_big.hasClass('slick-initialized') && slider_thumbs.hasClass('slick-initialized')) {
						slider_big.slick('unslick');
						slider_thumbs.slick('unslick');
					}
	
					slider_big.slick({
						autoplay: autoplay,
						autoplaySpeed: pause,
						infinite: infinite,
						slidesToShow: 1,
						slidesToScroll: 1,
						asNavFor: slider_thumbs,
						draggable: false,
						speed: speed,
						draggable: true,
						fade: true,
						arrows: false,
						dots: false
					});
				
					slider_thumbs.slick({
						autoplay: autoplay,
						autoplaySpeed: pause,
						vertical: param == 'desktop' ? true : false,
						infinite: infinite,
						verticalSwiping: param == 'desktop' ? true : false,
						draggable: true,
						slidesToShow: param == 'desktop' ? 4 : param == 'tablet' ? 3 : 1,
						slidesToScroll: 1,
						speed: speed,
						asNavFor: slider_big,
						focusOnSelect: true,
						swipe: true,
						arrows: $nav,
						dots: $dot,
						appendArrows: $controls,
						appendDots: $dots,
						prevArrow: '<button data-has-event="1" data-elem-type="container" data-lp-selector=".lpc-video-6__arrow" class="lpc-video-6__arrow lpc-video-6__arrow-prev js-prev-item _primary-fill _svg-light-fill"><div data-elem-type="container" class="arrow-line-wr" data-lp-selector=".arrow-line"><div class="arrow-line"></div><div class="arrow-line"></div></div></button>',
						nextArrow: '<button data-has-event="1" data-elem-type="container" data-lp-selector=".lpc-video-6__arrow" class="lpc-video-6__arrow lpc-video-6__arrow-next js-next-item _primary-fill _svg-light-fill"><div data-elem-type="container" class="arrow-line-wr" data-lp-selector=".arrow-line"><div class="arrow-line"></div><div class="arrow-line"></div></div></button>'
					});
					
					$(window).on('resize', limitTextLines);
	
					$this.find('.lpc-video-6__slider-thumbs .lpc-video-6__custom-video-btn').click(function() {
						$this.find('.lpc-video-6__thumbs-controls').toggle();
					});
	
					function limitTextLines() {
						let item_title = '.lpc-video-6__thumbs-item-title',
							item_text = '.lpc-video-6__thumbs-item-text';
	
						$this.find(item_title).css('max-height', '');
						$this.find(item_text).css('max-height', '');
	
						if (window.matchMedia('(min-width: 1024px)').matches) {
	
							let line_height_title = parseInt($(item_title).css('line-height')),
								line_height_text = parseInt($(item_text).css('line-height'));
	
							$(item_title).css('max-height', 2 * line_height_title);
							$(item_text).css('max-height', 3 * line_height_text);
						}
					}
				});
			})
			
			$(window).on('resize', function(){
				setTimeout(function(){
					var $dotItem = $block.find('.lpc-video-6__thumbs-dots li button');
					if ($dotItem.hasClass('lpc-video-6__slider-dot')) {
						
					}
					else {
						$dotItem.attr('data-elem-type', 'card_container');
						$dotItem.addClass('lpc-video-6__slider-dot');
						$dotItem.attr('data-lp-selector','.lpc-video-6__slider-dot');
						$dotItem.attr('data-has-event','1');
					}
				},500);
			});
		}
	}
	
    lpc_template.queue.lpcMenu1 = function($self) {
	    var $block = $self.hasClass('lpc-menu-1') ? $self : $self.find('.lpc-menu-1');
	    $block.each(function() {
	      if ($block.length) {
	
	        var $this = $(this),
	        	menu = '.lpc-menu-1',
				nav = '.lpc-menu-1-nav',
				navWrapper = '.lpc-menu-1-nav-wrapper',
				navItem = '.lpc-menu-1-nav__item',
				navSubList = '.lpc-menu-1-nav__sublist',
				navSubListArrow = '.lpc-menu-1-nav__sublist-arrow',
				navSubListArrowHtml = '<div class="lpc-menu-1-nav__sublist-arrow" data-has-event="1" data-elem-type="container" data-lp-selector=".lpc-menu-1-nav__sublist-arrow-line"><div class="lpc-menu-1-nav__sublist-arrow-line"></div><div class="lpc-menu-1-nav__sublist-arrow-line"></div></div>',
				navBurger = '.lpc-menu-1__burger',
				navPopup = '.lpc-menu-1__popup',
				navPopupClass = 'lpc-menu-1__popup-menu',
				navPopupCloseBtn = '.lpc-menu-1__popup-close-btn',
				navPopupWrapper = '.lpc-menu-1__popup-wrapper',
				navPopupOverlay = '.lpc-menu-1__popup-wrapper>.lp-block-bg .lp-block-overlay';
	        
	        let dataMediaSource = $('.lpc-menu-1').attr('data-media-source');
	
	        function displayBurger(show, hide) {
	          $this.find(hide).removeClass('_show');
	          $this.find(show).addClass('_show');
	        }
	        
	        function checkNavWidth() {
	          let navWrapperWidth = $(navWrapper).width(),
	              navWidth = $this.find(nav).width();
	          if (navWidth > navWrapperWidth) {
	            displayBurger(navBurger, nav);
	            $this.find(navPopup + '-menu').css('display', '');
	          } else {
	            displayBurger(nav, navBurger);
	            closeSideMenu();
	          }
	        }
	
	        function openSideMenu() {
	          $this.find(navPopup).addClass('_opened');
	          $this.find(navPopupWrapper).css('height', '100vh').addClass('_opened');
	          //$this.find(navPopupOverlay).css('background-color', 'rgba(68, 68, 68, 0.6)');
	        }
	
	        function closeSideMenu() {
	          //$(navPopupOverlay).css('background-color', 'rgba(68, 68, 68, 0)');
	          $(navPopup).removeClass('_opened');
	          setTimeout(function(){
	            $(navPopupWrapper).css('height', '0').removeClass('_opened');
	            $(navSubList).slideUp();
	            $(navSubListArrow).removeClass('_opened');
	          }, 700);
	        }
	
	        try {
	          $this.find(navBurger).on('click', function(){openSideMenu();});
	          
	          $this.find(navPopupOverlay).on('click', function(){closeSideMenu()});
	          
	          $this.find(navPopupCloseBtn).on('click', function(){closeSideMenu()});
	
	          checkNavWidth();
			  
	          $this.find(nav + ' li').has('ul').addClass('hasChild');
	          $this.find(nav + ' .hasChild').append(navSubListArrowHtml);
	
	          $this.find(nav).clone().appendTo($this.find(navPopup)).addClass(navPopupClass).css('display', '');
	          
	          $(this).find(navPopup + ' a').on('click', function(){
	          	closeSideMenu();
	          });
	
	          $this.find(navSubListArrow).on('click', function() {
	            $(this).toggleClass('_opened').siblings('ul').stop().slideToggle(400);
	          });
	
	          $(window).resize(function(){
	            checkNavWidth();
	          });
	          
	          setTimeout(function(){
	          	$(window).trigger('resize');
	          }, 700);
	          
	        } catch(exception) {
	          console.log(exception);
	        }
	      }
	    });
	}
	
	lpc_template.queue.lpcMenu2 = function($self) {
	    var $block = $self.hasClass('lpc-menu-2') ? $self : $self.find('.lpc-menu-2');
	    $block.each(function() {
			if ($block.length) {
	      	
			    let $this = $(this),
			    	$list = $this.find('.lpc-menu-2__list'),
			        $item = $this.find('.lpc-menu-2__item'),
			        $items = $list.children($item),
			        $button_wrap = $this.find('.lpc-menu-2__button-wrap'),
			        $button = $this.find('.lpc-menu-2__button'),
			        $aside_button = $this.find('.lpc-menu-2__aside-button');
			
			    let $sideMenu = $this.find('.lpc-menu-2__aside-wrap'),
			        $sideMenuOverlay = $this.find('._overlay');
			
			
			    try {
			        wrapList();
			
			        $button.on('click', function () {
			            openSideMenu();
			        });
			
			        $aside_button.on('click', function () {
			            closeSideMenu();
			        });
			
			        $sideMenuOverlay.on('click', function () {
			            closeSideMenu();
			        });
			        
			        $this.find('.lpc-menu-2__aside-wrap a').on('click', function(){
			        	closeSideMenu();
			        });
			
			        $(window).on('resize', function () {
			            wrapList();
			            closeSideMenu();
			        });
			
			    } catch(exception) {
			        console.log(exception);
			    }
			    
			    function wrapList() {
			        $list.css('display', '');
			        $button_wrap.css('display', '');
			
			        if (window.matchMedia('(min-width: 768px)').matches) {
			
			            let $itemsWidth = 0;
			            let $listWidth = $list.width();
			
			            $items.each(function (index, element) {
			                $itemsWidth += $(element).outerWidth(true);
			            });
			
			            if ($listWidth < $itemsWidth) {
			                $list.css('display', 'none');
			                $button_wrap.css('display', 'flex');
			            }
			        }
			    }
			
			    function openSideMenu() {
			        $sideMenu.addClass('_open');
			        $sideMenuOverlay.addClass('_open');
			        $sideMenuOverlay.css('visibility', 'visible');
			    }
			
			    function closeSideMenu() {
			        $sideMenu.removeClass('_open');
			        $sideMenuOverlay.removeClass('_open');
			        setTimeout(function () {
			            $sideMenuOverlay.css('visibility', 'hidden')
			        }, 400);
			    }
	
			}
		});
	}
	
	lpc_template.queue.faq3 = function($self) {
		$block = $self.find('.js-qa-3');

		if ($block.length) {
			$block.each(function(){
				var $this = $(this),
					$thisItems = $this.find('.lpc-qa-3-tabs-item');
					$thisEmptyDiv = $this.find('.lpc-qa-3-content-items');

				$this.on('click', '.js-qa-title', function(e){
					e.preventDefault();

					var $this = $(this),
						$parent = $this.closest('.lpc-qa-3-tabs-item');

					if ($parent.hasClass('active')) return;

					$thisItems.removeClass('active');
					$parent.addClass('active');
					$thisEmptyDiv.html($parent.find('.lpc-qa-3-content-item').html());

				});

				$this.find('.js-qa-title').eq(0).trigger('click');
			});
			
			$doc.on('checkDeviceType', function(e, param) {
				if (param!='desktop') return;
				
				$block.each(function(){
					var $this = $(this),
						$thisTitle = $this.find('.lpc-qa-3__title');
						
					if (!$thisTitle.length) return;
					
					$this.find('.lpc-qa-3-content-items').css({
						marginTop: +$thisTitle.outerHeight() + +$thisTitle.css('margin-bottom')
					})
				});
				
				
			});
		}
	}

	lpc_template.queue.lpcGallery1 = function($self) {
	    var $block = $self.hasClass('lpc-gallery-1') ? $self : $self.find('.lpc-gallery-1');
	
	    if ($block.length) {
	        $block.each(function() {
	            var $this = $(this),
	                $mainSlider = $this.find('.lpc-gallery-1__main'),
	                gallerySlider = $this.find('.lpc-gallery-1__main'),
	                dataMediaSource = $('.lpc-gallery-1').attr('data-media-source'),
	                $dots = $this.find('.lpc-gallery-1__preview'),
	                itemsCount = $this.find('.lpc-gallery-1__main').children('.lpc-gallery-1__main-image').length;
	
	            try {
	                initLightGallery();
	                initOwlCarousel();
	
	                $this.find('.lpc-gallery-1__preview-more').on('click', function() {
	                    $this.find('.lpc-gallery-1__main-image:first-child').trigger('click');
	                });
	
	                $(window).resize(function(){
	                    let newDataMediaSource = $('.lpc-gallery-1').attr('data-media-source');
	                    if (newDataMediaSource != dataMediaSource) {
	                        hidePreviews(newDataMediaSource);
	                        dataMediaSource = newDataMediaSource;
	                    }
	                });
	
	                $(document).on('checkDeviceType', function(e, param) {
	                    setTimeout(function(){
	                        $(window).trigger('resize');
	                    },100);
	                });
	
	                setTimeout(function(){
	                    $(window).trigger('resize');
	                    $mainSlider.trigger('refresh.owl.carousel');
	                    makePreviews();
	                },500);
	
	            } catch(exception) {
	                console.log(exception);
	            }
	
	            function makePreviews() {
	                $this.find('.lpc-gallery-1__main-image').each(function(index, element){
	                    let item = $(this).children('img').clone();
	                    $this.find('.lpc-gallery-1__preview').children('.js-owl-dot').eq(index).addClass('lpc-gallery-1__preview-image').prepend(item);
	                });
	                hidePreviews(dataMediaSource);
	            }
	
	            function hidePreviews(dataMediaSource) {
	                if (dataMediaSource == 'desktop') {
	                    if (itemsCount>6) {
	                        $this.find('.lpc-gallery-1__preview').children('.js-owl-dot').slice(5, itemsCount).css('display', 'none');
	                        $this.find('.lpc-gallery-1__preview-more').css('display', '');
	                    } else {
	                        $this.find('.lpc-gallery-1__preview-more').css('display', 'none');
	                    }
	                } else {
	                    $this.find('.lpc-gallery-1__preview').children('.js-owl-dot').css('display', '');
	                    $this.find('.lpc-gallery-1__preview-more').css('display', 'none');
	                }
	            }
	
	            function initLightGallery() {
	                $this.find('.lpc-gallery-1__main.js-lg').lightGallery({
	                    selector: '.lpc-gallery-1__main-image.js-lg-item',
	                    nextHtml: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.98528 4.32805C9.3758 3.93753 10.009 3.93753 10.3995 4.32805L17.0563 10.9849C17.4469 11.3754 17.4469 12.0086 17.0563 12.3991L10.3995 19.056C10.009 19.4465 9.3758 19.4465 8.98528 19.056C8.59475 18.6654 8.59475 18.0323 8.98528 17.6418L14.935 11.692L8.98528 5.74226C8.59475 5.35174 8.59475 4.71857 8.98528 4.32805Z" fill="white"/></svg>',
	                    prevHtml: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.8492 5.03516L8.19239 11.692L14.8492 18.3489" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
	                });
	            };
	
	            function initOwlCarousel() {
	                gallerySlider.owlCarousel({
	                    loop: false,
	                    rewind: false,
	                    items: 1,
	                    dots: true,
	                    nav: true,
	                    margin: 0,
	                    navContainer: '.lpc-gallery-1-controls',
	                    navClass: ['js-prev-item','js-next-item'],
	                    onTranslated: function(e){
	                        $dots.find('.js-owl-dot').attr('data-lp-selector', '.lpc-gallery-1__preview-image');
	                        $dots.find('.js-owl-dot').removeClass('active').eq(e.page.index).addClass('active').attr('data-lp-selector', '.lpc-gallery-1__preview-image.active');
	                    },
	                    onInitialized: function(e){
	                        addClasses($mainSlider, $this);
	
	                        if ($dots.length) {
	                            var dotsLength = $mainSlider.find('.owl-dots > *').length;
	                            if (dotsLength <= 1) {
	                                $dots.html('');
	
	                            } else {
	                                var dotItems = '',
	                                    dotClass = $dots.data('dot-class');
	
	                                for (let i = 0; i < dotsLength; i++) {
	                                    dotItems += '<div class="js-owl-dot _primary-fill ' + dotClass +'" data-elem-type="container" data-lp-selector=".lpc-gallery-1__preview-image" data-has-event="1"></div>'
	                                }
	
	                                $dots.html(dotItems);
	                                $dots.find('.js-owl-dot').eq(0).addClass('active');
	
	                            }
	                        }
	                    }
	                });
	
	                $dots.find('.js-owl-dot').on('click', function(e) {
	                    var $newDot = $(this),
	                        $owlItems = $mainSlider.find('.owl-item'),
	                        newIndex = $newDot.index(),
	                        oldIndex = $newDot.parent().find('.active').index(),
	                        scrolledItems = (newIndex - oldIndex);
	
	                    $mainSlider.trigger('to.owl.carousel', [$(this).index()]);
	
	                    removeClasses($mainSlider);
	
	                    if (oldIndex < newIndex) {
	                        $owlItems.addClass('movingLeft');
	                    } else if (oldIndex > newIndex) {
	                        $owlItems.addClass('movingRight');
	                        scrolledItems *= -1;
	                    }
	
	                    if (scrolledItems > 1500) {
	                        scrolledItems = 1500;
	                    }
	
	                    setTimeout(function() {
	                        addClasses($mainSlider, $this);
	                    }, scrolledItems);
	
	                    setTimeout(function () {
	                        $owlItems.removeClass('movingLeft movingRight');
	                    }, scrolledItems);
	                });
	
	                function addClasses($slider, $parent) {
	                    if ($this.width() >= 1024) {
	                        $slider.find('.owl-item.active').next().addClass('next-1').next().addClass('next-2').next().addClass('next-3');
	                        $slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2').prev().addClass('prev-3');
	                    } else if ($this.width() >= 768) {
	                        $slider.find('.owl-item.active').next().addClass('next-1').next().addClass('next-2');
	                        $slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2');
	                    }
	                }
	
	                function removeClasses($slider) {
	                    $slider.find('.owl-item').removeClass('next-1 next-2 next-3 prev-1 prev-2 prev-3');
	                }
	            };        
	        });
	    }
	}
	
	lpc_template.queue.lpcGallery2 = function($self) {
	    var $block = $self.hasClass('lpc-gallery-2') ? $self : $self.find('.lpc-gallery-2');
	
	    $block.each(function() {
			if ($block.length) {
			
				let $thisBlock = $(this),
					$owlSlider = $('.lpc-gallery-2__slider'),
					gallerySlider = '.lpc-gallery-2__slider',
			        dataCount = parseInt($thisBlock.find('.lpc-gallery-2__slider').attr('data-count')),
			        dataMediaSource = $thisBlock.attr('data-media-source'),
			        itemsCount = $thisBlock.find('.lpc-gallery-2__slider').children('.lpc-gallery-2__item').length,
			        gridWrapper = '<div class="lpc-gallery-2__slider-grid"></div>',
			        
			        carouselSpeed = $thisBlock.find(gallerySlider).data('speed'),
			        infinite = !!$thisBlock.find(gallerySlider).data('infinite'),
					autoplay = !!$thisBlock.find(gallerySlider).data('autoplay'),
					pause = $thisBlock.find(gallerySlider).data('pause'),
					$navPrev = $thisBlock.find('.js-prev-item'),
					$navNext = $thisBlock.find('.js-next-item'),
					$dots = $thisBlock.find('.lpc-gallery-2__dots');
			
			    try {
			        formGrid(dataMediaSource);
			        $thisBlock.find('.lpc-gallery-2__slider.js-lg').lightGallery({
			            selector: '.lpc-gallery-2__item',
			            nextHtml: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.98528 4.32805C9.3758 3.93753 10.009 3.93753 10.3995 4.32805L17.0563 10.9849C17.4469 11.3754 17.4469 12.0086 17.0563 12.3991L10.3995 19.056C10.009 19.4465 9.3758 19.4465 8.98528 19.056C8.59475 18.6654 8.59475 18.0323 8.98528 17.6418L14.935 11.692L8.98528 5.74226C8.59475 5.35174 8.59475 4.71857 8.98528 4.32805Z" fill="white"/></svg>',
						prevHtml: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.8492 5.03516L8.19239 11.692L14.8492 18.3489" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
			        });
			        setTimeout(function(){
			        	initOwlCarousel();
			        },1500);
			
			        $(window).resize(function(){
			        	setTimeout(function(){
				            let newDataMediaSource = $thisBlock.attr('data-media-source');
				            if (newDataMediaSource != dataMediaSource) {
				                if (dataCount > 4 || newDataMediaSource == 'mobile' || dataMediaSource == 'mobile') {
				                    reInitOwlCarousel(newDataMediaSource);
				                }
				                dataMediaSource = newDataMediaSource;
				            }
			        	},100);
			        });
			    } catch(exception) {
			        console.log(exception);
			    }
			
			
			
			    function sliceFunc(itemsInGrid){
			        for (var i = 0; i < itemsCount/itemsInGrid; i++) {
			            $thisBlock.find('.lpc-gallery-2__slider>.lpc-gallery-2__item').slice(0, itemsInGrid).wrapAll(gridWrapper);
			        }
			        $thisBlock.find('.lpc-gallery-2__slider-grid').each(function(){
			            $(this).addClass('_'+$(this).children().length);
			        });
			    };
			
			    function formGrid(dataMediaSource) {
			        if (dataMediaSource == 'mobile') {
			            sliceFunc(2)
			        } else if (dataMediaSource == 'tablet' && dataCount > 4){
			            sliceFunc(8);
			        } else {
			            sliceFunc(dataCount*2)
			        }
			    }
			
			    function initOwlCarousel() {
			        $(gallerySlider).owlCarousel({
			            loop: infinite,
			            items: 1,
			            autoplay: autoplay,
		            	autoplayTimeout: pause,
		            	autoplayHoverPause: true,
		            	smartSpeed: carouselSpeed,
			            dots: true,
			            nav: true,
			            margin: 0,
						onTranslated: function(e){
							$dots.find('.lpc-simple-dot-item').removeClass('active').eq(e.page.index).addClass('active');
							
						},
						onInitialized: function(e){
							addClasses($owlSlider, $thisBlock);
							
							if ($dots.length) {
								var dotsLength = $thisBlock.find('.owl-dots > *').length;
								if (dotsLength <= 1) {
									$dots.html('');
									
									$navPrev.addClass('_hide');
									$navNext.addClass('_hide');
									
								} else {
									var dotItems = '',
										dotClass = $dots.data('dot-class');
									
									for (let i = 0; i < dotsLength; i++) {
										dotItems += '<div class="lpc-simple-dot-item ' + dotClass +'" data-elem-type="container" data-lp-selector=".lpc-simple-dot-item" data-has-event="1"></div>'
									}
									
									$dots.html(dotItems);
									$dots.find('.lpc-simple-dot-item').eq(0).addClass('active');
									
								}
							}
							if(!s3LP.is_cms) {
								s3LP.convertImages($owlSlider);
							}
							else {
								LpController.convertImages
							}
						},
						onResized: function() {
							var dotsLength = $thisBlock.find('.owl-dots > *').length;
							
							if (dotsLength <= 1) {
								$navPrev.addClass('_hide');
								$navNext.addClass('_hide');
								
							} else {
								$navPrev.removeClass('_hide');
								$navNext.removeClass('_hide');
							}
						}
			        });
			        
			        $owlSlider.trigger('refresh.owl.carousel');
		        
			        $navPrev.off();
						
					$navPrev.on('click', function(e){
						e.preventDefault();
						$owlSlider.trigger('prev.owl.carousel');
						removeClasses($owlSlider);
						addClasses($owlSlider, $thisBlock);
					});
					
					$navNext.off();
					
					$navNext.on('click', function(e){
						e.preventDefault();
						$owlSlider.trigger('next.owl.carousel');
						removeClasses($owlSlider);
						addClasses($owlSlider, $thisBlock);
					});
					
					$dots.find('.lpc-simple-dot-item').on('click', function(e) {
						var $newDot = $(this),
							$owlItems = $owlSlider.find('.owl-item'),
							newIndex = $newDot.index(),
							oldIndex = $newDot.parent().find('.active').index(),
							scrolledItems = (newIndex - oldIndex) * carouselSpeed;
					
						$owlSlider.trigger('to.owl.carousel', [$(this).index()]);
					
						removeClasses($owlSlider);
					
						if (oldIndex < newIndex) {
							$owlItems.addClass('movingLeft');
						} else if (oldIndex > newIndex) {
							$owlItems.addClass('movingRight');
							scrolledItems *= -1;
						}
					
						if (scrolledItems > 1500) {
							scrolledItems = 1500;
						}
					
						setTimeout(function() {
							addClasses($owlSlider, $thisBlock);
						}, scrolledItems);
					
						setTimeout(function () {
							$owlItems.removeClass('movingLeft movingRight');
						}, scrolledItems);
					});
			    
				    function addClasses($slider, $parent) {
						if ($thisBlock.width() >= 1024) {
							$slider.find('.owl-item.active').next().addClass('next-1').next().addClass('next-2').next().addClass('next-3');
							$slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2').prev().addClass('prev-3');
						} else if ($thisBlock.width() >= 768) {
							$slider.find('.owl-item.active').next().addClass('next-1').next().addClass('next-2');
							$slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2');
						}
				    }
				
					function removeClasses($slider) {
						$slider.find('.owl-item').removeClass('next-1 next-2 next-3 prev-1 prev-2 prev-3');
					}
			    };
			
			    function reInitOwlCarousel(dataMediaSource) {
			        $thisBlock.find(gallerySlider).trigger('destroy.owl.carousel');
			        $thisBlock.find('.lpc-gallery-2__dots-wrap').append('<div class="lpc-gallery-2__dots"></div>');
			        $thisBlock.find('.lpc-gallery-2__item').unwrap();
			        formGrid(dataMediaSource);
			        initOwlCarousel();
			    };
			}
	    });
	}
	
	lpc_template.queue.lpcGallery5 = function($self) {
		var $block = $self.find('.js-gallery-5'),
			deviceTypes = ['desktop', 'tablet', 'mobile'];
		
		if ($block.length) {
			$block.each(function() {
				var $this = $(this),
					thisItems = $this.data('items'),
					carouselSpeed = $this.data('speed'),
					pause = $this.data('pause'),
					infinite = !!$this.data('infinite'),
					autoplay = !!$this.data('autoplay'),
					$parent = $this.closest('[data-block-layout]'),
					$dots = $parent.find('.js-simple-slider-dots'),
					$arrows = $parent.find('.js-simple-slider-nav');
					
				$(document).on('checkDeviceType', function(e, param){
					$this.trigger('destroy.owl.carousel');
					
					$this.owlCarousel({
						items: thisItems[deviceTypes.indexOf(param)],
						loop: infinite || false,
						autoplay: autoplay || false,
						autoplayTimeout: pause || 5000,
						smartSpeed: carouselSpeed || 250,
						autoplayHoverPause: true,
						dots: true,
						nav: false,
						onTranslated: function(e){
							$dots.find('.lpc-simple-dot-item').removeClass('active').eq(e.page.index).addClass('active');
						},
						onInitialized: function(e){
							if ($dots.length) {
								var dotsLength = $parent.find('.owl-dots > *').length;
								if (dotsLength <= 1) {
									$dots.html('');
									
								} else {
									var dotItems = '',
										dotClass = $dots.data('dot-class');
									
									for (let i = 0; i < dotsLength; i++) {
										dotItems += '<div class="lpc-simple-dot-item ' + dotClass +'" data-elem-type="container" data-lp-selector=".lpc-simple-dot-item"></div>'
									}
									
									$dots.html(dotItems);
									$dots.find('.lpc-simple-dot-item').eq(0).addClass('active');
									
								}
							}
						}
			        });
				});
				
				
				
				if ($arrows.length) {
					$arrows.on('click', '.js-prev-item', function(e) {
						e.preventDefault();
						$this.trigger('prev.owl.carousel');
					});
					
					$arrows.on('click', '.js-next-item', function(e) {
						e.preventDefault();
						$this.trigger('next.owl.carousel');
					})
				}
			});
		}
		
	}
	
	lpc_template.queue.lpcReviews3 = function($self) {
	    var $block = $self.hasClass('lpc-reviews-3') ? $self : $self.find('.lpc-reviews-3');
	
	    $block.each(function() {
	      if ($block.length) {
	
	        var $parent = $(this),
	        	$this = $parent.find('.lpc-reviews-3__slider'),
				$arrows = !!$this.data('arrows'),
	            $dots = !!$this.data('dots'),
	            $autoplay = !!$this.data('autoplay'),
	            $infinite = !!$this.data('infinite'),
	            $autoplaySpeed = $this.data('autoplay-speed'),
	            $speed = $this.data('speed'),
	            $slide = $this.find('.lp-reviews-10-slider__slide'),
		    	//list = '.lpc-reviews-3__slider',
		        item = $parent.find('.lpc-reviews-3__item'),
		        items = $this.children(item);
		
		    try {
		
		        initSlick();
		
		        $this.on('breakpoint', function (event, slick, breakpoint) {
		
		            $this.slick('unslick');
		
		            let slides = $parent.find('.lpc-reviews-3__slider').find('.lpc-reviews-3__item');;
		            if (slides.length > items.length) {
		                for (let j = 0; j < slides.length - items.length; j++) {
		                    slides[slides.length - 1 - j].remove();
		                }
		            }
		
		            $parent.find('.lpc-reviews-3__controls').show();
		
		            initSlick();
		        });
		
		
		    } catch(exception) {
		        console.log(exception);
		    }
		
		    function initSlick() {
		
		        fillSlide();
		
		        $this.slick({
		        	infinite: $infinite,
		        	autoplay: $autoplay,
					autoplaySpeed: $autoplaySpeed,
					speed: $speed,
		            swipe: true,
		            rows: 3,
		            slidesPerRow: 1,
		            focusOnSelect: true,
		            arrows: $arrows,
	                dots:$dots,
		            appendArrows: $parent.find('.lpc-reviews-3__navs'),
		            appendDots: $parent.find('.lpc-reviews-3__dots-wrap'),
		            prevArrow:'<a href="#" data-elem-type="card_container" data-has-event="1" data-lp-selector=".lpc-reviews-3-slider__nav-button" class="lp-button lp-button--type-1 lpc-reviews-3-slider__nav-button _prev js-prev-item _v2-icon"><div class="_slider-arrows" data-elem-type="card_container" data-lp-selector="._slider-arrows-inner"><div class="_slider-arrows-inner"></div><div class="_slider-arrows-inner"></div></div></a>',
	                nextArrow:'<a href="#" data-elem-type="card_container" data-has-event="1" data-lp-selector=".lpc-reviews-3-slider__nav-button" class="lp-button lp-button--type-1 lpc-reviews-3-slider__nav-button _next js-next-item _v2-icon"><div class="_slider-arrows reverse" data-elem-type="card_container" data-lp-selector="._slider-arrows-inner"><div class="_slider-arrows-inner"></div><div class="_slider-arrows-inner"></div></div></a>',
		            responsive: [
		                {
		                    breakpoint: 768,
		                    settings: {
		                        slidesPerRow: 1,
		                        rows: 1,
		                        arrows: false
		                    }
		                }
		            ]
		        });
		
		        $('.lpc-reviews-3__controls') // find the parents
		            .not(':has(> div:not(:empty))') // select only those that have no children with content
		            .hide() // hide them
		        ;
		    }
		    
	        $(window).on('resize', function(){
	        	setTimeout(function(){
	        		var $dotItem = $parent.find('.lpc-reviews-3__dots-wrap li button');
	        		if ($dotItem.hasClass('lpc-reviews-3-slider__dot')) {
	        			
	        		}
	        		else {
				        $dotItem.attr('data-elem-type', 'card_container');
				        $dotItem.addClass('lpc-reviews-3-slider__dot');
				        $dotItem.attr('data-lp-selector','.lpc-reviews-3-slider__dot');
	        		}
	        	},100);
	        });
		
		    function fillSlide() {
		        if (window.matchMedia('(min-width: 768px)').matches) {
		
		            $this.on('init', function (slick, currentSlide) {
		                let slides = currentSlide.$slides,
		                    lastSlide = slides[slides.length - 1],
		                    lastSlideItems = lastSlide.children,
		                    emptyDivs = [];
		
		                if (slides.length > 1) {
		                    for (let i = 0; i < lastSlideItems.length; i++) {
		                        if (lastSlideItems[i].childNodes.length < 1) {
		                            emptyDivs.push(lastSlideItems[i]);
		                        }
		                    }
		
		                    if (emptyDivs.length > 0) {
		                        for (let j = 0; j < emptyDivs.length; j++) {
		                            emptyDivs[j].appendChild($(items)[j].cloneNode(true));
		                        }
		                    }
		                }
		            });
		        }
		    }
	      }
	    });
	}
	
	lpc_template.queue.lpcReviews5 = function($self) {
        var $block = $self.hasClass('lpc-reviews-5') ? $self : $self.find('.lpc-reviews-5');
    
        $block.each(function() {
            if ($block.length) {
                var $parent = $(this),
                    $this = $parent.find('.js-owl-carousel'),
                    carouselSpeed = $this.data('speed'),
                    infinite = !!$this.data('infinite'),
                    autoplay = !!$this.data('autoplay'),
                    pause = $this.data('pause'),
                    $navPrev = $parent.find('.js-prev-slide'),
                    $navNext = $parent.find('.js-next-slide'),
                    $dots = $parent.find('.js-simple-slider-dots'),
                    $item_content = $('.lpc-reviews-5__item-content'),
                    $item_img = $('.lpc-reviews-5__item-img');

                try {
                	setTimeout(function () {
	                    initOwlCarousel();
	                    setImgHeight();
                    },1500);

                    $(window).on('resize', function(){
                        setTimeout(function () {
                            setImgHeight();
                        },300);
                    });

                } catch(exception) {
                    console.log(exception);
                }
                
                function setImgHeight() {
                    if (window.matchMedia('(min-width: 768px)').matches) {
                        $item_content.each(function () {
                            let item_img = $(this).siblings($item_img),
                                height = $(this).height() + parseInt($(this).css("padding-top")) + parseInt($(this).css("padding-bottom"));
                            ;

                            item_img.height('');

                            if (item_img.height() > height) {
                                item_img.height(height);
                            }
                        });
                    }
                }

                function initOwlCarousel() {
                    $this.owlCarousel({
                        loop: infinite,
                        autoplay: autoplay,
                        autoplayTimeout: pause,
                        smartSpeed: carouselSpeed,
                        autoplayHoverPause: true,
                        mouseDrag: false,
                        items: 1,
                        dots: true,
                        nav: false,
                        responsive: {
                            768: {
                                nav: true
                            }
                        },
                        onTranslated: function(e){
                            $dots.find('.lpc-simple-dot-item').removeClass('active').eq(e.page.index).addClass('active');
	                    	setImgHeight();
                        },
                        onInitialized: function(e){
                            addClasses($this, $parent);
                            
                            if ($dots.length) {
                                var dotsLength = $parent.find('.owl-dots > *').length;
                                if (dotsLength < 1) {
                                    $dots.html('');
                                    
                                } else {
                                    var dotItems = '',
                                        dotClass = $dots.data('dot-class');
                                    
                                    for (let i = 0; i < dotsLength; i++) {
                                        dotItems += '<div class="lpc-simple-dot-item ' + dotClass +'" data-elem-type="container" data-lp-selector=".lpc-simple-dot-item"></div>'
                                    }
                                    
                                    $dots.html(dotItems);
                                    $dots.find('.lpc-simple-dot-item').eq(0).addClass('active');
                                    
                                }
                            }
                        }
                    });
                    
                    $navPrev.on('click', function(e){
                        e.preventDefault();
                        $this.trigger('prev.owl.carousel');
                        removeClasses($this);
                        addClasses($this, $parent);
                    });
                    
                    $navNext.on('click', function(e){
                        e.preventDefault();
                        $this.trigger('next.owl.carousel');
                        removeClasses($this);
                        addClasses($this, $parent);
                    });
                    
                    $dots.find('.lpc-simple-dot-item').on('click', function(e) {
                        var $newDot = $(this),
                            $owlItems = $this.find('.owl-item'),
                            newIndex = $newDot.index(),
                            oldIndex = $newDot.parent().find('.active').index(),
                            scrolledItems = (newIndex - oldIndex) * carouselSpeed;
                    
                        $this.trigger('to.owl.carousel', [$(this).index()]);
                    
                        removeClasses($this);
                    
                        if (oldIndex < newIndex) {
                            $owlItems.addClass('movingLeft');
                        } else if (oldIndex > newIndex) {
                            $owlItems.addClass('movingRight');
                            scrolledItems *= -1;
                        }
                    
                        if (scrolledItems > 1500) {
                            scrolledItems = 1500;
                        }
                    
                        setTimeout(function() {
                            addClasses($this, $parent);
                        }, scrolledItems);
                    
                        setTimeout(function () {
                            $owlItems.removeClass('movingLeft movingRight');
                        }, scrolledItems);
                    });
                
                    function addClasses($slider, $parent) {
                        if ($parent.width() >= 1024) {
                            $slider.find('.owl-item.active').next().addClass('next-1').next().addClass('next-2').next().addClass('next-3');
                            $slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2').prev().addClass('prev-3');
                        } else if ($parent.width() >= 768) {
                            $slider.find('.owl-item.active').next().addClass('next-1').next().addClass('next-2');
                            $slider.find('.owl-item.active').prev().addClass('prev-1').prev().addClass('prev-2');
                        }
                    }
                
                    function removeClasses($slider) {
                        $slider.find('.owl-item').removeClass('next-1 next-2 next-3 prev-1 prev-2 prev-3');
                    }

                };
            }
        });
    }
    
    lpc_template.queue.lpcCarousel2 = function($self) {
        var $block = $self.hasClass('lpc-carousels-2') ? $self : $self.find('.lpc-carousels-2');
    
        $block.each(function() {
            if ($block.length) {

                var $parent = $(this),
                    $this = $parent.find('.js-owl-carousel'),
                    carouselSpeed = $this.data('speed'),
                    infinite = !!$this.data('infinite'),
                    pause = $this.data('pause'),
                    $navPrev = $parent.find('.js-lpc-carousels-2-prev-slide'),
                    $navNext = $parent.find('.js-lpc-carousels-2-next-slide'),
                    $dots = $parent.find('.js-simple-slider-dots');

                try {
                    
                    setTimeout(function(){
                    	initOwlCarousel();
                    	$(window).trigger('resize');
                	},1500);
                } catch(exception) {
                    console.log(exception);
                }

                function initOwlCarousel() {
                    $this.owlCarousel({
                        loop: infinite,
                        autoplay: false,
                        autoplayTimeout: pause,
                        smartSpeed: carouselSpeed,
                        autoplayHoverPause: true,
                        dots: true,
                        nav: false,
                        items: 1,
                        responsive:{
                            768:{
                                autoWidth: true,
                                center: true,
                                items: 3,
                                dots: true,
                                nav: false
                            }
                        },
						onTranslated: function(e){
							$dots.find('.lpc-simple-dot-item').removeClass('active').eq(e.page.index).addClass('active');
						},
						onInitialized: function(e){
							addClasses($this, $parent);
							
							if ($dots.length) {
								var dotsLength = $parent.find('.owl-dots > *').length;
								if (dotsLength < 1) {
									$dots.html('');
									$navPrev.addClass("_hide");
									$navNext.addClass("_hide");
								} else {
									var dotItems = '',
										dotClass = $dots.data('dot-class');
									
									for (let i = 0; i < dotsLength; i++) {
										dotItems += '<div class="lpc-simple-dot-item ' + dotClass +'" data-elem-type="container" data-lp-selector=".lpc-simple-dot-item"></div>'
									}
									
									$dots.html(dotItems);
									$dots.find('.lpc-simple-dot-item').eq(0).addClass('active');
									
								}
							}
						},
						onResize: function() {
							var dotsLength = $parent.find('.owl-dots > *').length;
							if (dotsLength < 1) {
								$navPrev.addClass("_hide");
								$navNext.addClass("_hide");
							} else {
								$navPrev.removeClass("_hide");
								$navNext.removeClass("_hide");
							}
						}
                    });

                    if (window.matchMedia('(min-width: 768px)').matches) {
                        addClasses();
                    }

                    $this.on('resized.owl.carousel', function (event) {
                        if (window.matchMedia('(min-width: 768px)').matches) {
                            $this.trigger('destroy.owl.carousel');
                            initOwlCarousel();
                        }
                    });

                    $this.on('dragged.owl.carousel changed.owl.carousel initialized.owl.carousel', function (event) {
                        if (window.matchMedia('(min-width: 768px)').matches) {
                            removeClasses();
                            addClasses();
                        }
                    });
                    
                    $navPrev.on('click', function(e){
						e.preventDefault();
						$this.trigger('prev.owl.carousel');
						removeClasses($this);
						addClasses($this, $parent);
					});
					
					$navNext.on('click', function(e){
						e.preventDefault();
						$this.trigger('next.owl.carousel');
						removeClasses($this);
						addClasses($this, $parent);
					});
					
					$dots.find('.lpc-simple-dot-item').on('click', function(e) {
						var $newDot = $(this),
							$owlItems = $this.find('.owl-item'),
							newIndex = $newDot.index(),
							oldIndex = $newDot.parent().find('.active').index(),
							scrolledItems = (newIndex - oldIndex) * carouselSpeed;
					
						$this.trigger('to.owl.carousel', [$(this).index()]);
					
						removeClasses($this);
					
						if (oldIndex < newIndex) {
							$owlItems.addClass('movingLeft');
						} else if (oldIndex > newIndex) {
							$owlItems.addClass('movingRight');
							scrolledItems *= -1;
						}
					
						if (scrolledItems > 1500) {
							scrolledItems = 1500;
						}
					
						setTimeout(function() {
							addClasses($this, $parent);
						}, scrolledItems);
					
						setTimeout(function () {
							$owlItems.removeClass('movingLeft movingRight');
						}, scrolledItems);
					});

                    function addClasses() {
                        let center = $this.find('.owl-item.center');
                        center.next().addClass('next');
                        center.prev().addClass('prev');
                        center.find('.lpc-carousels-2__item').addClass('current-slide');
                        center.find('.lpc-carousels-2__item').attr('data-lp-selector', '.lpc-carousels-2__item.current-slide');
                        
                        center.siblings('.owl-item').find('.lpc-carousels-2__item').removeClass('current-slide');
                        center.siblings('.owl-item').find('.lpc-carousels-2__item').attr('data-lp-selector', '.lpc-carousels-2__item');
                    }

                    function removeClasses() {
                        $this.find('.owl-item').removeClass('next prev');
                    }
                }
            }
        });
    }
    
    lpc_template.queue.lpcText7 = function($self) {
	    var $block = $self.hasClass('lpc-text-7') ? $self : $self.find('.lpc-text-7');
    	$block.each(function() {
			if ($block.length) {
				var $this = $(this),
					$content = $this.find('.lpc-text-7__content'),
					$imgWrap = $this.find('.lpc-text-7__img-wrap'),
					$imgItems = $this.find('.lpc-text-7__img-items');
				
		        try {
		            let childs = $imgItems.children().length;
		            setAutoRows(childs);
		            $(window).on('resize', function(){
		                setAutoRows(childs);
		            });
		            
		            setTimeout(function(){
		            	$(window).trigger('resize');
		            });
		        } catch(exception) {
		            console.log(exception);
		        }
		
			    function setAutoRows(childs) {
			        if (window.matchMedia('(min-width: 1024px)').matches) {
			
			            let imgSetCount = Math.ceil(childs/3),
			                contentHeight = $content.height() +
			                    parseInt($content.css('padding-top')) +
			                    parseInt($content.css('padding-bottom')),
			                imgWrapHeight = contentHeight -
			                    parseInt($imgWrap.css('padding-top')) -
			                    parseInt($imgWrap.css('padding-bottom')),
			                imgItemsMinHeigth = parseInt($imgItems.css('min-height'));
			
			            if (imgWrapHeight > imgItemsMinHeigth*imgSetCount) {
			
			                let imgSetHeight = (imgWrapHeight - 32*(imgSetCount - 1))/imgSetCount,
			                    autoRows = (imgSetHeight - 32)/2;
			
			                $imgItems.css('grid-auto-rows', autoRows);
			            } else {
			                $imgItems.css('grid-auto-rows', '');
			            }
			        } else {
			            $imgItems.css('grid-auto-rows', '');
			        }
			    }
			}
		});
	}
	
	lpc_template.queue.lpcText8 = function($self) {
		var $block = $self.find('.js-text8');
	
		if ($block.length) {
	
			$block.each(function(){
				var $this = $(this),
					$list = $this.find('.lpc-text-8__tabs'),
					$nav = $this.find('.js-simple-slider-nav'),
					$tabs = $this.find('.js-tab-item'),
					$contents = $this.find('.js-content'),
					activeClass = '_active';
	
				$doc.on('checkDeviceType', function(e, param) {
					destroyOwlCarousel($list);
	
					if (param === 'desktop') {
						initOwlCarousel($list);
					}
				});
	
	
				if ($nav.length) {
					$nav.on('click', '.js-prev-slide', function(e) {
						e.preventDefault();
						$list.trigger('prev.owl.carousel');
					});
					
					$nav.on('click', '.js-next-slide', function(e) {
						e.preventDefault();
						$list.trigger('next.owl.carousel');
					});
				}
	
				$list.on('click', '.js-tab-item', function() {
					var $this = $(this);
	
					$tabs.removeClass(activeClass);
					$contents.removeClass(activeClass);
	
					$this.addClass(activeClass);
					$contents.filter(function() {
						return $(this).data('index') === $this.data('index');
					}).addClass(activeClass);
				});
	
			});
	
		}
	
		function initOwlCarousel($list) {
			$list.owlCarousel({
				loop: false,
				items: 1,
				autoPlay: false,
				autoWidth: true,
				dots: false,
				nav: false
			});
		};
	
		function destroyOwlCarousel($list) {
			$list.owlCarousel('destroy');
		}
	}
    
    lpc_template.queue.videoPlayButton = function($self) {
		var $allVideoParets = $self.find('.js-lp-play-video').closest('.lp-video-block-wrappper');

		$self.on('click', '.js-lp-play-video', function(e) {
			e.preventDefault();
			
			var $this = $(this);
			var thisVideo = $this.parent('.lp-video-block-wrappper').find('video')[0];
			
			$this.addClass('hide');
			thisVideo.play();
			thisVideo.setAttribute('controls', 1);
		});
		
		$allVideoParets.find('video').each(function(){
			this.addEventListener('pause', function(){
				this.removeAttribute('controls');
				$(this).parent('.lp-video-block-wrappper').find('.js-lp-play-video').removeClass('hide')
			});
		});
	}
    
    lpc_template.queue.autoplayVideo = function($self) {
		var $block = $self.find('[data-autoplay-video="1"]');
	
		if ($block.length) {
			$block.on('autoplayVideo', function(e, type, nodeName) {
				var video = this.querySelector(nodeName);
				
				if (nodeName === 'video') {
					if (type === 'play') {
						video.play();
					} else {
						video.pause();
					}					
				} else if (nodeName === 'iframe') {
					var video = $(video).data('youtube');
	
					if (type === 'play') {
						video.playVideo();
					} else {
						video.pauseVideo();
					}
				}
			});
		}
		
		setTimeout(function(){
			$win.trigger('scroll');
		}, 1000);
	}
	
	lpc_template.queue.lg = function($self) {
		var $block = $self.find('.js-lg-init');
		
		if ($block.length) {
			setTimeout(function(){
				$block.lightGallery({
					selector: '.lg-item',
					toogleThumb: false,
					getCaptionFromTitleOrAlt: false,
					download: false,
					thumbWidth: 64,
					thumbHeight: '64px',
					addClass: '_lpc-lg',
					nextHtml: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.98528 4.32805C9.3758 3.93753 10.009 3.93753 10.3995 4.32805L17.0563 10.9849C17.4469 11.3754 17.4469 12.0086 17.0563 12.3991L10.3995 19.056C10.009 19.4465 9.3758 19.4465 8.98528 19.056C8.59475 18.6654 8.59475 18.0323 8.98528 17.6418L14.935 11.692L8.98528 5.74226C8.59475 5.35174 8.59475 4.71857 8.98528 4.32805Z" fill="white"/></svg>',
					prevHtml: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.8492 5.03516L8.19239 11.692L14.8492 18.3489" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
				});
			}, 500);
		}
	}
	
    
    lpc_template.checkAutoplayVideo = function($blocks) {
		$blocks.each(function() {
			var $this = $(this),
				playStatus = $this.data('playStatus'),
				inViewport = isElementInViewport(this),
				$video = $this.find('video'),
				$thisVideo = $video.length ? $video : $this.find('iframe');
	
			if (inViewport && playStatus !== 'play') {
				$this.trigger('autoplayVideo', ['play', $thisVideo[0].nodeName.toLowerCase()]);
				$this.data('playStatus', 'play');
			} else if (!inViewport && playStatus === 'play') {
				$this.trigger('autoplayVideo', ['pause', $thisVideo[0].nodeName.toLowerCase()]);
				$this.data('playStatus', 'pause');
			}
		})
	}
	
	window.lp_init = function($block) {
		
		if (s3LP.is_cms) {
			var contentColor = $('#lpc_contructor_iframe').contents().find('.decor-wrap').css('color')
			$('#landing_page_site').css('color', contentColor);
		}
		
		$win.on('resize', function() {
			var decorWidth = $('.decor-wrap').width();
			$('.lpc-block').css('max-width', decorWidth);
		}).trigger('resize');
		
		Object.keys(lpc_template.queue).forEach(function(func) {
			var thisFunction = lpc_template.queue[func];
			if (typeof thisFunction == 'function') {
				thisFunction($block);
			}
		});
		
		var $autoplayVideo = $doc.find('[data-autoplay-video="1"]');
		
		if ($autoplayVideo.length && !s3LP.is_cms && window.self == window.top) {
			$win.on('scroll', function() {
				lpc_template.checkAutoplayVideo($autoplayVideo);
			});
		}
		
		lpc_template.deviceType = null;
		
		$win.on('resize', function() {
			lpc_template.adaptiveBlock();
			
			$('.js-proportion-height').each(function() {
				var $this = $(this);
				
				setProportionHeight($this, $this.data('proportion') || 100);
			});
			
			
		}).trigger('resize');
		
		if (s3LP.is_cms) {
		
			LpController.convertImages($block);
			
			setTimeout(function(){
				LpController.convertImages($block);
				LpController.afterSave(function () {
					$('.lpc-features-3-chart-item__number').each(function(){
						var $this = $(this);
						$this.closest('.lpc-features-3-chart-item').find('.lpc-features-3-chart-item__bar-inner').css('width', $this.text());
					});
				});
			}, 1000);
		}
		
		if (document.location.hash.length > 1 && $(document.location.hash).length) {
			setTimeout(function() {
				$('html, body').scrollTop($(document.location.hash).offset().top);
			}, 200);
		}
	}
	
	window.onYouTubeIframeAPIReady = function() {
		$(function(){
			var listYoutube = $('.js-lp-video-youtube');
			
			listYoutube.each(function(){
				var $this = $(this),
					isFullFrame = $this.hasClass('_not-paused');
				
				var player = new YT.Player(this.id, {
					iv_load_policy: 3,
					modestbranding: 1,
					rel: 0,
					mute: isFullFrame ? 1 : 0,
					playsinline: 1,
					showinfo: isFullFrame ? 0 : 1,
					events: {
						'onStateChange': function(event) {
							if (event.data == YT.PlayerState.ENDED && $(event.target.a).hasClass('_not-paused')) {
								event.target.playVideo();
							}
						}
					}
				});
	
				$this.data('youtube', player);
			});
		});
	}
	
	function isElementInViewport(el) {
		var rect = el.getBoundingClientRect();
		return (
			rect.top <= window.innerHeight-200 &&
			rect.bottom >= 50
		);
	}
	
	function setProportionHeight ($block, proportion) {
		$block.height($block.width() * proportion/100);
	}
})();