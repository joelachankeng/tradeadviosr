$(function() {
    
    $currentTrend = 'uptrend';
    $above50EMA = true;
    $above200EMA = true;

    positions = [];
    
    warnings = [];
    watches = [];
    actionsList = [];

    function action() {
        this.type =  $above200EMA ? 'buy' : 'sell';

        this.getMACD = function() {
           this.type == 'buy' ? $color = 'Red' : $color = 'Green';
            return this.type + ' @ Fade ' + $color + ' MACD';
        }

        this.getEMA50 = function() {
            return this.type + ' @ 50 EMA';
        }

        this.getEMA200 = function() {
            return this.type + ' @ 200 EMA';
        }

        this.getHedge = function() {
           this.type == 'buy' ? $hedgeType = 'sell' : $hedgeType = 'buy';
            return  'Hedge above '+ $hedgeType ;
        }

        this.clear = function() {
            $(".actions").empty();
        }
        
        this.push = function($action) {
            $element = "<span class='action button'>"+ $action +"</span>";
            $('.actions').append($element);
        }

        this.MACD = this.getMACD();
        this.EMA50 = this.getEMA50();
        this.EMA200 = this.getEMA200();
        this.Hedge = this.getHedge();
    };

    function updateProgressBar() {
        $(".progress").each(function() {
  
            var value = $(this).attr('data-value');
            var left = $(this).find('.progress-left .progress-bar');
            var right = $(this).find('.progress-right .progress-bar');
        
            if (value > 0) {
                if (value <= 50) {
                right.css('transform', 'rotate(' + percentageToDegrees(value) + 'deg)')
                } else {
                right.css('transform', 'rotate(180deg)')
                left.css('transform', 'rotate(' + percentageToDegrees(value - 50) + 'deg)')
                }
            }
        
        })
    }

    function percentageToDegrees(percentage) {
        return percentage / 100 * 360
    }

    function updateTrend() {        
        if($above200EMA == true) {
            $('.status .trend').removeClass('down');
            $('.status .trend').addClass('up');
            $('.status .trend').text('Uptrend');
        } else {
            $('.status .trend').removeClass('up');
            $('.status .trend').addClass('down');
            $('.status .trend').text('Downtrend');
        }
    }

    function updateWatchlist() {

    }

    updateProgressBar();
    actions = new action();
    update();
    
    function update() {
        updateProgressBar();
        updateTrend();
        updateActions();
        updateWatchlist();
    }

    function updateActions() {
        actions.clear();
        if(positions.length == 0) {
            if($above200EMA) {
                actions.push(actions.MACD);
                actions.push(actions.EMA200);
                if($above50EMA) {
                    actions.push(actions.EMA50);
                   
                }
            }
        }
    }

    $( ".50ema.switch" ).on( "click", function() {
        if($(".50ema.switch").is(':checked')) {
            $above50EMA = false;
        }
        else{
            $above50EMA = true;
        }
        update();
    });

    $( ".200ema.switch" ).on( "click", function() {
        if($(".200ema.switch").is(':checked')) {
            $above200EMA = false;
        }
        else{
            $above200EMA = true;
        }
        update();
    });

  });