/*
 * jquery.flot.advancedlegend
 */ 
(function ($) {

    // plugin options, default values
    var defaultOptions = {
        advancedLegend: {
        	enabled: true,
        	
        	
        	shared:  true,
        	element: {
        		placeholder: null,
        		id: '',
        		classes: ['flot-legend'],
            	position: 'fixed', // options: [point,fixed]
            	attach: ['top', 'right'], // options: [ center|top|bottom, center|left|right ]
        	},
        	
        	togglable: true,
        	labelFormatter: function( name, series ){
        		return name;
        	},
        	
        	
            // cursor offset
            offset: {
                x: 10,
                y: 10
            },

            // callbacks
            events: {
            	hover: function(flotLegend, $legendEl) {},
            	click: function(flotLegend, $legendEl) {},
            	showSingle: function(flotLegend, $legendEl) {},
            	showToggle: function(flotLegend, $legendEl) {},
            }
            
        }
    };

    // object
    var FlotAdvancedLegend = function(plot) {

        // variables
    	this.plot = plot;
    	this.plotOptions = {};
    	this.options = {};

    	this.wrapper = null;
    	this.legend = null;

        this.init(this.plot);
    };

    // main plugin function
    FlotAdvancedLegend.prototype.init = function(plot) {

    	
        var that = this;

        plot.hooks.bindEvents.push(function (plot, eventHolder) {

        	that.plot = plot;
        	
            // get plot options
            that.plotOptions = plot.getOptions();

            // if not enabled return
            if (typeof that.plotOptions.advancedLegend === 'undefined' || that.plotOptions.advancedLegend.enabled === false) return;

            // shortcut to access tooltip options
            that.options = that.plotOptions.advancedLegend;

            // create tooltip DOM element
            that.legend = that.getDomElement();
        	that.updatePosition();

            // bind event
            //$( plot.getPlaceholder() ).bind("plothover", plothover);
 
        });

        plot.hooks.draw.push(function(plot, canvascontext){
        	if(!that.legend) // there are no legends yet
        		return;
        	
        	var togglable = that.options.togglable;
        	
        	that.legend.empty();
            var data = plot.getData();
            for( var i=0 ; i<data.length ; i++){
            	var name = that.options.labelFormatter(data[i].label, data[i]);
            	var colour = data[i].color;
            	
            	var disabled = data[i].lines.show === false;
            	
            	that.legend.append(
        			'<tr>'+
            			'<td class="legendColorBox" data-id="'+data[i].id+'">'+
            				'<div style="border:1px solid #ccc;padding:1px">'+
            					'<div style="width:4px;height:0;border:5px solid '+colour+';overflow:hidden"></div>'+
            				'</div>'+
            			'</td>'+
            			'<td class="legendLabel">'+
            				(togglable ? '<a href="" class="toggle-legend'+(disabled ? ' disabled' : '')+'" data-id="'+data[i].id+'">' + name + '</a>' : name) +
            			'</td>'+
            		'</tr>'
            	);
            }
            

        	that.updatePosition();

        	that.legend.find('.toggle-legend').click(ToggleLegend);
        	that.legend.find('.legendColorBox').click(ToggleAllLegends);
        	that.legend.find('.legendColorBox').dblclick(function(){
        		SelectAllLegends(true);
        	});
        });

        
		plot.hooks.shutdown.push(function (plot, eventHolder){
        	that.legend.find('.toggle-legend').unbind('click', ToggleLegend);
        	that.legend.find('.legendColorBox').unbind('click', ToggleAllLegends);
        	that.legend.find('.legendColorBox').dblclick('click');
		});
		
    	function ToggleLegend(){

	    	var plot = that.plot;
            
	    	// find our plot 
	    	var points = plot.getData();
	        for(var k = 0; k < points.length; k++){
	             if(points[k].id == $(this).attr('data-id')){
	            	 var newState = !points[k].lines.show;
	            	 if(!newState)
	            		 $(this).addClass('disabled');
	            	 else
	            		 $(this).removeClass('disabled');
	            		 
	            	 points[k].lines.show = newState;
	            		 
	             }
	        }
	        
	        plot.setData(points);
	        plot.draw();
	        
	        return false;
    	}
    	
    	function ToggleAllLegends(){

	    	var plot = that.plot;
            
	    	// find our plot 
	    	var points = plot.getData();
	        for(var k = 0; k < points.length; k++){
	             if(points[k].id == $(this).attr('data-id')){
	            	 points[k].lines.show = true;
	            	 $(this).removeClass('disabled');
	             } else {
	            	 var newState = false;
	            	 if(!newState)
	            		 $(this).addClass('disabled');
	            	 else
	            		 $(this).removeClass('disabled');
	            		 
	            	 points[k].lines.show = newState;
	             }
	        }
	        
	        plot.setData(points);
	        plot.draw();
	        
	        return false;
    	}
    	
    	function SelectLegends( newState ){

	    	var plot = that.plot;
            
	    	// find our plot 
	    	var points = plot.getData();
	        for(var k = 0; k < points.length; k++){
            	 points[k].lines.show = newState;
            	 $(this).removeClass('disabled');
	        }
	        
	        plot.setData(points);
	        plot.draw();
	        
	        return false;
    	}

    };

    /**
     * get or create tooltip DOM element
     * @return jQuery object
     */
    FlotAdvancedLegend.prototype.getDomElement = function() {
        var $tip;

        if(this.legend)
        	return this.legend;
        	
        if(this.options.element.placeholder)
        	return this.options.element.placeholder;

        var id 		= this.options.element.id;
        var classes = this.options.element.classes.join('.');
        var chartPh = this.plot.getPlaceholder();
            
        this.wrapper = $('<div class="flot-legend" />');
        this.legend = $('<table id="'+id+'">');
        
        this.legend.appendTo(this.wrapper);
        this.wrapper.appendTo(chartPh);
        
        return this.legend;
    };

    // as the name says
    FlotAdvancedLegend.prototype.updatePosition = function(x, y) {
        
        var tipWidth = this.legend.outerWidth() + this.options.offset.x;
        var tipHeight = this.legend.outerHeight() + this.options.offset.y;
        
        var pageX = x - $(window).scrollLeft();
        var pageY = y - $(window).scrollTop();
        
        var css = {
        	top: 'inherit',
        	left: 'inherit',
        	bottom: 'inherit',
        	right: 'inherit',
        };
        
        var isAtPointer = this.options.element.position == 'pointer';
        var xPos = this.options.element.attach[1];
        var yPos = this.options.element.attach[0];
        if( xPos == 'left' ){
        	css.left = isAtPointer ? x - tipWidth -  this.options.offset.x : this.options.offset.x ;
        } else if( xPos == 'right' ){
        	css.right = isAtPointer ? x : this.options.offset.x;
        } else if ( xPos == 'center' ){
        	css.left = isAtPointer ? x - (tipWidth / 2) : this.options.offset.x ;
        }
        if( yPos == 'top' ){
        	css.top = isAtPointer ? y - tipWidth -  this.options.offset.x : this.options.offset.y ;
        } else if( yPos == 'bottom' ){
        	css.bottom = isAtPointer ? y : this.options.offset.y;
        } else if( yPos == 'center' ){
        	css.top = isAtPointer ? y - (tipHeight / 2) : this.options.offset.y ;
        }
        
        this.wrapper.css(css).show();
    };
    //
    var init = function(plot) {
      new FlotAdvancedLegend(plot);
    };

    // define Flot plugin
    $.plot.plugins.push({
        init: init,
        options: defaultOptions,
        name: 'advancedLegend',
        version: '1.0.0'
    });

})(jQuery);
