$(function() {
    
    $currentTrend = 'uptrend';
    $above50EMA = true;
    $above200EMA = true;

    positions= [];

    actionsList = [];

    actions = new action();
    warnings = new warn();
    watches = new watch();
    posMan = new managePositions();
    
    update();

    function position(type) {

        this.type = type;
        this.pips = 0;
        this.open = true;

        this.parent = $('.positions'); 

        this.getType = function() {
            if(this.type == 'buy') {
                $elementOption = "<option selected>Buy</option><option>Sell</option>";
            } else {
                $elementOption = "<option>Buy</option><option selected>Sell</option>";
            }
            return "<select class='type'>" + $elementOption + "</select>";
        }

        this.getPips = function() {
            return "<input type='number' class='pips' maxlength='2' value='" + this.pips +"'>";
        }

        this.getOpen = function() {
            if(this.open) {
                $elementOption = "<option selected>Open</option><option>Closed</option>";
            } else {
                $elementOption = "<option>Open</option><option selected>Closed</option>";
            }
            return "<select class='condition'>" + $elementOption + "</select>";
        }
    }

    function isOpen($pos) { 
        return $pos.open == true;
    }

    function isBuy($pos) { 
        return $pos.type == 'buy';
    }

    function isSell($pos) { 
        return $pos.type == 'sell';
    }

    function watch()  {
        this.parent = $('.watchlist .warner'); 
        this.type =  $above200EMA ? 'buy' : 'sell';

        this.getMACD = function() {
           this.type == 'buy' ? $color = 'Red' : $color = 'Green';
            return 'Waiting for Fade ' + $color + ' MACD';
        }

        this.getEMA50 = function() {
            return 'Waiting for Candle touch 50 EMA';
        }

        this.getEMA200 = function() {
            return 'Waiting for Candle touch @ 200 EMA';
        }

        this.clear = function() {
            this.parent.empty();
        }

        this.push = function($watch) {
            $element = "<span class='watching button no-hover'>"+ $watch +"</span>";
            this.parent.append($element);
        }

        this.waitMACD = this.getMACD();
        this.waitEMA50 = this.getEMA50();
        this.waitEMA200 = this.getEMA200();
    }

    function warn() {
        this.parent = $('.watchlist .watcher');

        this.getLastMax = function() {
            $maxDir = $above200EMA ? 'high' : 'low';
            // $maxDir = $above200EMA ? 'resistance' : 'support';
            return "Be careful of last " + $maxDir;
        }

        this.getEMA50 = function() {
            return 'Be Careful of 50 EMA';
        }

        this.clear = function() {
            this.parent.empty();
        }
        
        this.push = function($warning) {
            $element = "<span class='warning button no-hover'>"+ $warning +"</span>";
            this.parent.append($element);
        }

        this.watchLastMax = this.getLastMax();
        this.watchEMA50 = this.getEMA50();
    }

    function action() {
        this.parent = $('.actions');
        this.type =  $above200EMA ? 'buy' : 'sell';

        this.getMACD = function() {
           this.type == 'buy' ? $color = 'Red' : $color = 'Green';
            return { id: 'getMACD', print: this.type + ' @ Fade ' + $color + ' MACD' };
        }

        this.getNegaMACD = function() {
            this.negaType =  $above200EMA ? 'sell' : 'buy';
            this.type == 'buy' ? $negaColor = 'Green' : $negaColor = 'Red';
            return { id: 'getNegaMACD', print: this.negaType + ' @ Fade ' + $negaColor + ' MACD' };
         }

        this.getEMA50 = function() {
            return { id: 'getEMA50', print: this.type + ' @ 50 EMA' };
        }

        this.getEMA200 = function() {
            return { id: 'getEMA200', print: this.type + ' @ 200 EMA' };
        }

        this.getHedge = function() {
            this.type == 'buy' ? $hedgeType = 'buy' : $hedgeType = 'sell';
            $hedgeType == 'buy' ? $hedgeDir = 'below' : $hedgeDir = 'above';
            return { id: 'getHedge', print:  'Hedge '+ $hedgeDir + ' ' + $hedgeType  };
        }

        this.getHedgeAction = function() {
            this.type == 'buy' ? $hedgeType = 'sell' : $hedgeType = 'buy';
            return { id: 'getHedgeAction', print:  $hedgeType + ' @ last Hedge '+ this.type  };
        }

        this.clear = function() {
            this.parent.empty();
        }
        
        this.push = function($action) {
            $element = "<span class='action button' id='"+ $action.id +"'>"+ $action.print +"</span>";
            this.parent.append($element);
        }

        this.MACD = this.getMACD();
        this.negaMACD = this.getNegaMACD();
        this.EMA50 = this.getEMA50();
        this.EMA200 = this.getEMA200();
        this.Hedge = this.getHedge();
        this.HedgeAction = this.getHedgeAction();
    }

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

    function updateWarning() {
        warnings.clear();
        if(positions.length == 0) {
            if($above200EMA) {
                if($above50EMA) {

                }
            }
        }
        else {
            if($above200EMA) {
                warnings.push(warnings.watchLastMax);
                if($above50EMA) {

                } else {
                    warnings.push(warnings.watchEMA50);
                }
            }
        }
    }

    function updateWatchlist() {
        watches.clear();
        if(positions.length == 0) {
            if($above200EMA) {
                watches.push(watches.waitMACD);
                watches.push(watches.waitEMA200);
                if($above50EMA) {
                    watches.push(watches.waitEMA50);

                }
            }
        }
    }

    function updateActions() {
        actions.clear();
        if (positions.length == 0 || positions.filter(isOpen).length == 0) {
            if($above200EMA) {
                actions.push(actions.MACD);
                actions.push(actions.EMA200);
                if($above50EMA) {
                    actions.push(actions.EMA50);
                   
                }
            }
        } else {
            if($above200EMA) {
                if(positions.filter(isOpen).find(isSell)) {
                    $openSells = positions.filter(isOpen).filter(isSell);
                    $openBuys = positions.filter(isOpen).filter(isBuy);
                    // console.log($openSells);
                    // console.log($openBuys);
                    if($openBuys.length > $openSells.length) {
                        actions.push(actions.HedgeAction);
                        actions.push(actions.negaMACD);
                        actions.push(actions.Hedge);
                    } else {
                        actions.push(actions.MACD);
                        actions.push(actions.EMA200);
                        if($openBuys.length == $openSells.length) {
                            if($above50EMA) {
                                actions.push(actions.EMA50);
                            }
                        }
                    }
                } else {
                    actions.push(actions.negaMACD);
                    actions.push(actions.Hedge);
                }
                
            }
        }
    }

    function updatePositions() {
        $('.positions').empty();
        if(positions.length != 0) {
            $.each(positions, function(key, $position){
                $element = "<div class='position' id="+ key +"><span class='id'>"+ key +"</span>"
                + $position.getType() + $position.getPips() + $position.getOpen()
                + "</div>";
                $('.positions').append($element);
            });
        }        
    }

    function managePositions() {

        this.addPosition = function($nega) {
            if($nega) {
                $above200EMA ? positions.push(new position('sell')) : positions.push(new position('buy'));
            } else {
                $above200EMA ? positions.push(new position('buy')) : positions.push(new position('sell'));
            }
        }

        this.getFirstOpenPosition = function($type) {
            $openPos = positions.filter(isOpen);
            $type == 'buy' ? $openPos = $openPos.find(isBuy) : $openPos = $openPos.find(isSell);
            return $openPos;
        }

        this.getLastOpenPosition = function($type) {
            $openPos = positions.filter(isOpen);
            $type == 'buy' ? $openPos = $openPos.filter(isBuy) : $openPos = $openPos.filter(isSell);
            return $openPos.pop();
        }

        this.check = function($actionID) {
            if (positions.length == 0 || positions.filter(isOpen).length == 0) {
                this.addPosition();
            } else {
                $openSells = positions.filter(isOpen).filter(isSell);
                $openBuys = positions.filter(isOpen).filter(isBuy);
                if($actionID == 'getNegaMACD' ) {
                    if($above200EMA) {
                        if($openBuys.length > $openSells.length) {
                            $lastPos = this.getLastOpenPosition('buy');
                            $lastPos.open = false;
                        } else {
                            this.addPosition(true);
                        } 
                    }
                }
                if($actionID == 'getHedge') {
                    if($above200EMA) {
                        this.addPosition(true);
                    }
                }
                if($actionID == 'getMACD' || $actionID == 'getEMA200' || $actionID == 'getEMA50' ) {
                    this.addPosition();
                }
                if($actionID == 'getHedgeAction') {
                    if($above200EMA) {
                        this.addPosition(true);
                    }
                }
            }
            update();
        }

        
    }

    function update() {
        updateProgressBar();
        updatePositions();
        updateTrend();
        updateActions();
        updateWarning();
        updateWatchlist();
    }

    
    $( ".actions" ).on("click", ".action.button", function() {
        posMan.check($(this).attr('id'));                
    });

    $('.positions').on('change', ".position .type", function() {
        $positionID = $(this).parent().attr('id');
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value.toLowerCase();
        positions[$positionID].type = valueSelected;
        update();
    });

    $('.positions').on('change', ".position .pips", function() {
        $positionID = $(this).parent().attr('id');
        var valueSelected = this.value;
        positions[$positionID].pips = valueSelected;
        update();
    });

    $('.positions').on('change', ".position .condition", function() {
        $positionID = $(this).parent().attr('id');
        var optionSelected = $("option:selected", this);
        var valueSelected = this.value.toLowerCase();
        valueSelected == "open" ? valueSelected = true : valueSelected = false;
        positions[$positionID].open = valueSelected;
        updatePositions();
    });

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