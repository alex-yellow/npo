var s3LP = {
	init: function(options) {
		var self = this;
		if (options){
			this.is_cms = options.is_cms ? true : false;
		}
		this.initForms();

		try {
			lp_init($('body'));
		} catch(e) {
			console.log(e);
		}
		this.pageBlocking();
		
		self.popupForm();

		if ($('body').find('._lp-image-container').length) {
			if (!window.hasOwnProperty('img_convert_cache')) {
                window.img_convert_cache = {};
            }
			var debounce = (function () {
				return function (fn, time) {
					var timer, func;
					func = function() {
						var args = [].slice.call(arguments, 0);
						window.clearTimeout(timer);
						timer = window.setTimeout(function () {
							window.requestAnimationFrame && window.requestAnimationFrame(function() {
								fn.apply(null, args);
							}) || fn.apply(null, args);
						}, time)
					};
					return func;
				}
			}());
			self.convertImages($('body'));
			$(window).on('resize', debounce(function() {
				self.convertImages($('body'));
			}, 200));
		}		
	},
	pageBlocking: function() {
		if (s3LP.page_blocking) {
			$('html, body').css({
				'overflow': 'hidden',
				'height': '100%'
			});
			$('<div />', {
				'class' : 'page-blocked'
			}).appendTo($('body'));
			
			$('.page-blocked').css({
				'background': 'rgba(0,0,0,.8)',
				'position': 'absolute',
				'left': 0,
				'right': 0,
				'bottom': 0,
				'top': 0,
				'z-index': 100000,
				'color': '#fff',
				'font-size': '28px',
				'display': 'flex',
				'align-items': 'center',
				'flex-direction': 'column',
				'padding': '10px',
				'text-align': 'center',
				'line-height':'1.5',
				'align-items': 'center',
				'justify-content': 'center'
			}).append('<b>Страница заблокирована</b><div style="font-size: 18px;">обратитесь в техническую поддержку</div>');
		}
	},
	initForms: function(parent) {
		var self = this;
		if (!parent) parent = document;
		if (!$(parent).is('[data-api-url][data-api-type=form]')) {
			parent = $(parent).find('[data-api-url][data-api-type=form]');
		}

		$(parent).each(function() {
			var obj = $(this);
			var form = obj.is("form") ? obj : obj.find("form");
			
			if (obj.data('s3form_inited')) {
				return;
			}

			if (self.is_cms) {
				form.attr('title', JS_LP_FORM_NOTE).tooltip();
				form.submit(function() {
					return false;
				});
			} else {
				form.submit(function() {
					$.post(obj.data('api-url'), form.serialize(), function(response) {
						if (response.result.success && response.result.redirect_url) {
							console.log('dfs');
							document.location = response.result.redirect_url;
						} else {
							if (response.result.html) {
								var replacement = $(response.result.html.replace(/[\r\n]/g, '').replace(/<script[^>]*>.*?<\/script>/g, ''));
								if (!$(replacement).is('[data-api-url][data-api-type=form]')) {
									replacement = $(replacement).find('[data-api-url][data-api-type=form]');
								}
								obj.replaceWith(replacement);
	
	
								// Init form calendars
								obj.find('.init-calendar').each(function(i){
									new tcal({
										'controlname':this.id,
										'place':this.parentNode,
										'lang':'ru'
									});
	
								});
	
								// Init form calendar intervals
								obj.find('.init-calendar-interval').each(function(i){
									for(var j=0; j<2; ++j){
										var e = f_getElement(this.id + '['+j+']');
										new tcal({
											'controlname':e.id,
											'place':e.parentNode,
											'lang':'ru',
											'intervalpair':[
												this.id + '[0]',
												this.id + '[1]'
											],
											'intervalupdatecont' : this.id
										});
									}
								});
	
								var $captcha = replacement.find('input[name=_cn]');
								if ($captcha.length) {
									$.getScript('http://captcha.oml.ru/static/captcha.js?2', function() {
										var $d = replacement.find("[id^=s3_captcha_cn]");
										mgCaptcha.draw("/my/s3/captcha/get.php", ($d.length ? $d.get(0) : null));
									});
								}
								self.initForms(replacement);
							}
						}
					});
					return false;
				});
			}
			obj.data('s3form_inited', true);
		})
	},

	convertImages: function ($container) {
        var self = this;

        $container.find('._lp-image-container').each(function() {
            var $img = $(this).find('img');

            if ($img.length) {
                var img_src = $img.attr('src');
                if (!window.img_convert_cache.hasOwnProperty(img_src)) window.img_convert_cache[img_src] = {};
                self.convertImg(window.img_convert_cache[img_src], $img);
            }
        });
    },
    
    popupForm: function() {
		var $body = $('body'),
			$html = $('html'),
			self = this;

		$('<div class="lp-popup-wrapper js-popup-wrapper"><div class="lp-popup-overlay"></div><div class="lp-popup-inner js-popup-inner"></div></div>').appendTo($body);

		var $wrapper = $('.js-popup-wrapper'),
			$newBlock,
			$container = $wrapper.find('.js-popup-inner'),
			$readyPopup = $body.find('[data-popup-type="ready"]'),
			$inactionPopup = $body.find('[data-popup-type="inaction"]'),
			openedClass = '_opened';
			
		if ($readyPopup.length) {
			$readyPopup.each(function() {
				var $this = $(this);
				
				setTimeout(function(){
					$newBlock = self.appendPopupForm($this, $container, $wrapper);
				}, +$this.data('popup-time'))
			});
		}
		
		if ($inactionPopup.length) {
			$inactionPopup.each(function() {
				var $this = $(this),
					thisTime = +$this.data('popup-time'),
					idleTimer = null,
					idleState = false;
					
				$(document).on('mousemove keydown scroll', function(){
					clearTimeout(idleTimer); // РѕС‚РјРµРЅСЏРµРј РїСЂРµР¶РЅРёР№ РІСЂРµРјРµРЅРЅРѕР№ РѕС‚СЂРµР·РѕРє
				
					if(idleState == true) return;
				
					idleState = false;
					
					idleTimer = setTimeout(function(){ 
						$newBlock = self.appendPopupForm($this, $container, $wrapper);
						idleState = true; 
					}, thisTime);
				});
				
				$(document).trigger('mousemove');
			});
		}

		$body.on('click', 'a[href^="popup:"]', function(e){
			e.preventDefault();

			var $thisBlock = $('#' + this.href.replace(':', ''));

			$newBlock = self.appendPopupForm($thisBlock, $container, $wrapper)
		});
		
		$container.on('click', '.js-close-popup', function(e) {
			e.preventDefault();
			
			$newBlock.appendTo($('body'));
			
			$container.html('');
			$wrapper.removeClass(openedClass);
			
			$html.css({
				overflow: 'auto'
			});
			
		});
		
		$(document).on('keyup', function(e){
			if (e.keyCode != 27) return;
			
			$newBlock.appendTo($('body'));
			
			$container.html('');
			$wrapper.removeClass(openedClass);
			
			$html.css({
				overflow: 'auto'
			});
		});
	},

	appendPopupForm: function($block, $container, $wrap) {
		var $newBlock = $block.prependTo($container),
			$html = $('html'),
			openedClass = '_opened';
			
		if (!$wrap.find('.lp-form-step-popup-inner').length) {
			var $uploads = $container.find('input[type="hidden"][id^="hidUploadField"]');

			if ($uploads.length) {
				$uploads.each(function(){
					var thisAttr = $(this).data('init-upload');
					newSWFU(void 0, thisAttr);
				});
			}
			
		} else {
			var $block = $wrap.find('.js-lp-steps-form');
			$block.html('');
			$block.formsteps();
		}
		
		$html.css({
			overflow: 'hidden'
		});

		$wrap.addClass(openedClass);
		
		return $newBlock;
	},

    convertImg : function (cache_img, $img) {
        var self = this;
        $img.css({"max-width": "100%", "max-height": "100%"});

        if (!$img.parent().hasClass('lp-img-contain')) {
            var img_width,
                img_height;

            if (!cache_img.hasOwnProperty('width') || !cache_img.hasOwnProperty('height')) {
                if ($img.is('svg') || ($img.attr('src') && $img.attr('src').slice(-3) == 'svg')) {
                    img_width = $img.parent().width();
                    img_height = $img.parent().height();
                } else {
                    img_width = $img[0].naturalWidth;
                    img_height = $img[0].naturalHeight;
                }
            } else {
                img_width = cache_img.width;
                img_height = cache_img.height;
            }

            self.setImgStyles($img, img_width, img_height, null);
        }
    },

    setImgStyles: function ($img, img_width, img_height, svg) {
        var $wrap = $img.parent();
        var wrap_width = parseInt($wrap.width()),
            wrap_height = parseInt($wrap.height()),
            wrap_prop = wrap_width/wrap_height;

        var min_width = wrap_height/img_height * img_width;

        if(img_width && img_height) {
            var img_prop = img_width/img_height;

            if (wrap_prop > img_prop) {
                $img.css({"max-width": "100%", "width": img_width > wrap_width ? wrap_width : img_width, "min-width": "0", "max-height": "none", "height": "auto"});
            } else {
                $img.css({"max-width": "none", "width": "auto", "min-width": min_width > img_width ? img_width : min_width, /*"min-height": "100%",*/  "max-height": "100%", "height": img_height > wrap_height ? wrap_height : img_height});

                if (svg) {
                    $img.css('min-height', '100%');
                }
            }
        }
    }
}