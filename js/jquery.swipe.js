;(function(factory) {
	if(typeof define === 'function' && define.amd) {
		define(['Hammer', 'jquery'], factory);
	} else {
		factory(Hammer, jQuery)
	}
})(function(Hammer, $){
	var orientationEvt = 'onorientationchange' in window ? 'orientationchange' : 'resize';  

	function transitionEnd() {
        var el = document.createElement('div');

        var transEndEventNames = {
          'WebkitTransition' : 'webkitTransitionEnd'
        , 'MozTransition'    : 'transitionend'
        , 'OTransition'      : 'oTransitionEnd otransitionend'
        , 'transition'       : 'transitionend'
        }

        for (var name in transEndEventNames) {
        	if (el.style[name] !== undefined) {
        		return { end: transEndEventNames[name] }
        	}
        }
    }

	function Swipe(el, opts) {
		this.$el = $(el);
		this.$carousel = this.$el.find(opts.carousel);
		this.opts = opts;
		this.init();
	}

	Swipe.DEFAULTS = {
		offsetCount: 2,
		staticCount: null,
		showNav: false,
		autoHeight: true,
		carouselContent: '.carousel-content',
		carousel: '.carousel-content > ul',
		carouselItem: 'li',
		carouselPrev: '.carousel-prev',
		carouselNext: '.carousel-next',
		disabledNav: 'disabled'
	}

	Swipe.prototype.init = function() {
		var opts = this.opts,
			self = this,
			$el = this.$el,
			$carousel = this.$carousel;

		this.index = 0;
		this.$carouselPrev = $el.find(opts.carouselPrev);
		this.$carouselNext = $el.find(opts.carouselNext);
		this.carouselLength = $carousel.find(opts.carouselItem).length; 
		
		this._getImageWidth()
			.done(function() {
				self._setItemWidth()
					._setWidth()
					._setHeight()
					._initOffsetCount()
					._initNav()
					._initFuncBind()
					._show();
			});
			
	}

	Swipe.prototype._show = function() {
		this.$carousel.css({
			'visibility': 'visible'
		});
	}

	Swipe.prototype._initFuncBind = function() {
		var self = this,
			opts = self.opts,
			$el = self.$el,
			$carousel = self.$carousel,
			$carouselPrev = self.$carouselPrev,
			$carouselNext = self.$carouselNext,
			timer;

		$carousel.hammer().on('swipeleft', function() {
			self.forWards();	
		}).on('swiperight', function() {
			self.backWards();
		}).on(transitionEnd().end, function() {
			self._afterSlide();
			if($.isFunction(opts.callback)) {
				opts.callback(Math.abs(self.index), $el, opts);
			}
		});

		$carouselPrev.hammer().on('tap',function() {
			self.backWards();
		});

		$carouselNext.hammer().on('tap', function() {
			self.forWards();
		});

		$(window).on(orientationEvt, function(e) {
			clearTimeout(timer);
			timer = setTimeout(function(){
				self.index = 0;
				self._setItemWidth()
					._initOffsetCount()
					._initNav()
					.nav(self.index).slide()._afterSlide(self._setWidth);
			}, 200);
		});

		return this;
	}

	Swipe.prototype._getImageWidth = function() {
		var opts = this.opts,
			$carousel = this.$carousel,
			$firstItem = $carousel.find(opts.carouselItem).first(),
			self = this,
			defer;

		defer = $.Deferred();
		
		$firstItem.find('img').on('load', function() {
			self.normalItemWidth = $firstItem.width();
			defer.resolve();
		});

		return defer;
	}

	Swipe.prototype._setItemWidth = function() {
		var $el = this.$el,
			opts = this.opts,
			$carousel = this.$carousel,
			$firstItem = $carousel.find(opts.carouselItem).first();

		var itemWidth;
		if(opts.staticCount == 1) {
			itemWidth = $el.find(opts.carouselContent).width();
			$carousel.find(opts.carouselItem).css({
				width: itemWidth
			});
			this.currentCount = opts.staticCount;
			this.itemWidth = itemWidth;
		} else {
			itemWidth = this.normalItemWidth;
			this.currentCount = Math.floor($el.width() / itemWidth);
			itemWidth = $el.width() / this.currentCount;
			$carousel.find(opts.carouselItem).css({
				width: itemWidth
			});
			this.itemWidth = itemWidth;
		}

		return this;
	}

	Swipe.prototype._setWidth = function() {
		var self = this,
			$carousel = this.$carousel,
			$el = this.$el;

		$carousel.css({
			width: this.carouselLength * this.itemWidth
		});

		return this;
	}

	Swipe.prototype._setHeight = function() {
		var $el = this.$el,
			opts = this.opts;

		if(!opts.autoHeight) {
			$el.css({
				height: $el.find(opts.carouselContent).height()
			});
		}

		return this;
	}

	Swipe.prototype._initNav = function() {
		var $el = this.$el,
			opts = this.opts;

		if(this.carouselLength > opts.offsetCount || opts.showNav) {
			this.$carouselPrev.css({
				top: $el.height() / 2
			}).show();
			this.$carouselNext.css({
				top: $el.height() / 2
			}).show();
		}
		return this;
	}

	Swipe.prototype._initOffsetCount = function() {
		var opts = this.opts,
			$el = this.$el,
			defaultOffsetCount = Swipe.DEFAULTS.offsetCount;

		if(opts.staticCount !== null) {
			opts.offsetCount = opts.staticCount;
		} else if (defaultOffsetCount == opts.offsetCount || opts.prevOffsetCount == opts.offsetCount) {
			opts.offsetCount = Math.floor($el.width() / this.itemWidth);
			opts.prevOffsetCount = opts.offsetCount;
		}
		return this;
	}

	Swipe.prototype.nav = function(index) {
		if(typeof index !== undefined) this.index = index;
		
		var opts = this.opts,
			index = Math.abs(this.index),
			carouselLength = this.carouselLength,
			currentCount = this.currentCount,
			disabledNav = opts.disabledNav,
			offsetCount = opts.staticCount ? opts.staticCount : opts.offsetCount,
			$carouselPrev = this.$carouselPrev,
			$carouselNext = this.$carouselNext;

		if(index == 0) {
			$carouselPrev.addClass(disabledNav);
			$carouselNext.removeClass(disabledNav);
		} else if((index + offsetCount) >= carouselLength) {
			$carouselNext.addClass(disabledNav);
			$carouselPrev.removeClass(disabledNav);
		} else {
			$carouselPrev.removeClass(disabledNav);
			$carouselNext.removeClass(disabledNav);
		}

		return this;
	}

	Swipe.prototype.backWards = function() {
		var opts = this.opts,
			disabledNav = opts.disabledNav,
			$carouselPrev = this.$carouselPrev;

		if($carouselPrev.hasClass(disabledNav)) return;

		if(Math.abs(this.index) < opts.offsetCount) {
			this.index += Math.abs(this.index);
		} else {
			this.index += opts.offsetCount;
		}
		this.nav(this.index).slide();
	}

	Swipe.prototype.forWards = function() {
		var opts = this.opts,
			disabledNav = opts.disabledNav,
			carouselLength = this.carouselLength,
			currentCount = this.currentCount,
			offsetCount = opts.offsetCount,
			$carouselNext = this.$carouselNext;

		if($carouselNext.hasClass(disabledNav)) return;
		
		if((carouselLength - offsetCount - Math.abs(this.index)) <= offsetCount) {
			if(offsetCount > currentCount) {
				this.index -= carouselLength - currentCount;
			} else {
				this.index -= carouselLength - offsetCount - Math.abs(this.index);
			}
		} else {
			this.index -= offsetCount;
		}
		this.nav(this.index).slide();
	}

	Swipe.prototype.slide = function() {
		var $el = this.$el,
			index = this.index,
			offsetWidth;

		offsetWidth = this.itemWidth * index;
		this.$carousel.css({
			'transform': 'translateX('+offsetWidth+'px)'
		});

		return this;
	}

	Swipe.prototype._afterSlide = function() {
		var args = Array.prototype.slice.call(arguments);
		for(var i = 0, len = args.length; i < len; i++) {
			if($.isFunction(args[i])) args[i].call(this);
		}
		return this;
	}

	$.fn.swipe = function(option) {
		var instance;

		this.each(function() {
			var options = $.extend({}, Swipe.DEFAULTS, typeof option == 'object' && option);
	        var $this = $(this);
	        var data  = $this.data('swipe');

	        if (!data) $this.data('swipe', instance = new Swipe(this, options));
	        if (typeof option == 'string') data[option]();
		});

		return instance;
	}

});