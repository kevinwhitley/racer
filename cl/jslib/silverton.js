
function Silverton()
{
    this._priceCharts = null;
    this._buildPriceCharts();
    this._selected = null;
    this._turn = 1;
}

/* original price chart data
Silverton.GoldChart =   [3000, 3500, 4000, 4500, 5000.1, 5000.2, 5500, 6000, 6500, 7000, 'Gold'];
Silverton.SilverChart = [1000, 1200, 1600, 1800, 2000.1, 2000.2, 2000.3, 2400, 3000, 4000, 'Silver'];
Silverton.CopperChart = [ 500,  600,  700,  800, 1000.1, 1000.2, 1200, 1400, 1600, 2000, 'Copper'];
Silverton.LumberChart = [ 100,  200,  300,  400,  500,  600,  800, 1000, 1200, 1500, 'Lumber'];
Silverton.CoalChart   = [ 100.1,  100.2,  150,  200,  300.1,  300.2,  400,  500,  600,  700, 'Coal'];
*/

/* newer price chart data */
Silverton.GoldChart =   [150, 175, 200, 225, 250.1, 250.2, 275, 300, 325, 350, 'Gold'];
Silverton.SilverChart = [100, 120, 160, 180, 200.1, 200.2, 200.3, 240, 300, 400, 'Silver'];
Silverton.CopperChart = [ 100,  120,  140,  160, 200.1, 200.2, 240, 280, 320, 400, 'Copper'];
Silverton.LumberChart = [ 30,  40,  60,  80,  100,  120,  160, 200, 240, 300, 'Lumber'];
Silverton.CoalChart   = [ 20.1,  20.2,  30,  40,  60.1,  60.2,  80,  100,  120,  140, 'Coal'];



Silverton.GoldChange =   [2, 2, 1, 1, 0, 0, -1, -1, -2];
Silverton.SilverChange = [5, 4, 3, 2, 1, 1,  0,  0, -1, -1, -2, -2, -3, -4, -5, -6, -7];
Silverton.CopperChange = [3, 3, 2, 1, 0, 0, -1, -1, -2, -2, -3, -3, -4];
Silverton.LumberChange = [3, 3, 2, 2, 1, 1,  0, -1, -1, -2, -2, -3, -3, -4];
Silverton.CoalChange   = [3, 3, 2, 2, 1, 1,  0,  0,  0, -1, -1, -2, -2, -3];
// idn number per turn.  Note that the game starts at turn 1 which is at index 1 in the array (not 0)
Silverton.IDN = [0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7];

Silverton.prototype.draw = function()
{
    // watch the background for clear-select events
    var content = $('#bigdiv');
    var context = this;
    content.bind(IpadTouchEvent, function(event){context.touchBackground(event);});

    var buttn = null;
    var actionF = null;
    // create price charts
    for (var ii=0; ii<this._priceCharts.length; ii++) {
        var chart = this._priceCharts[ii];
        var display = this._makePriceDisplay(ii, chart);
        var left = 20 + (ii % 5) * 150;
        var top = 20 + Math.floor(ii/5) * 200;
        dd_positionAbs(display, left, top);
        content.append(display);
    }

    // create some entry buttons
    var littlec = $('#entryCalc');
    for (var jj=1; jj<=10; jj++) {
        var actionF = function(){context.enter(this);};
        buttn = ipad_makeDButton(null, jj, actionF);
        buttn.enterValue = jj;
        $(buttn).addClass('entryButton');
        littlec.append(buttn);
    }
    
    buttn = ipad_makeDButton(null, 'c', function(){context.clear();});
    $(buttn).addClass('entryButton');
    littlec.append(buttn);

    // the turn end button
    buttn = ipad_makeDButton('turnEndB', 'End Turn', function(){context.turnEndTouched();});
    content.append(buttn);

    // the configure button
    buttn = ipad_makeDButton('configureB', 'Configure', function(){context.configureTouched();});
    content.append(buttn);

    // set turn button
    buttn = ipad_makeDButton(null, "Set", function(){context.setTurnTouched();});
    $(buttn).addClass('setB');
    $('#setTurnFrame').append(buttn);
    // set index button
    buttn = ipad_makeDButton(null, "Set", function(){context.setCommodityIndexTouched();});
    $(buttn).addClass('setB');
    $('#setIndexFrame').append(buttn);
};

Silverton.prototype.turnEndTouched = function()
{
    var context = this;
    var callback = function(val)
    {
        if (val === 0) {
            // user confirmed
            context.turnEnd();
        }
    }

    ipad_confirm('Run the turn?', ['Yes', 'No'], callback );
};

Silverton.prototype.configureTouched = function()
{
    $('#setTurn').css('display', 'block');
};

Silverton.prototype.setTurnTouched = function()
{
    this._turn = $('#turnConfigure').val();
    $('#turnCounter').html(this._turn);
};

Silverton.prototype.setCommodityIndexTouched = function()
{
    if (this._selected === null) {
        return;
    }
    var index = $('#indexConfigure').val();
    var chart = this._priceCharts[this._selected];

    chart.setIndex(index);
};

Silverton.prototype.turnEnd = function()
{
    // just do gold right now
    for (var ii=0; ii< 13; ii++) {
        this._priceCharts[ii].turnEnd();
    }

    this._turn++;
    $('#turnCounter').html(this._turn);

    // clear the current selection by "touching" the backgroun
    this.touchBackground(null);

    // hide the configure stuff, if it is showing
    $('#setTurn').hide();
    $('#configureB').hide();
};

Silverton.prototype._buildPriceCharts = function()
{
    var context = this;
    var lumberRollF = function(sale) {return context._lumberRoll(sale);};
    var coalARollF = function(sale) {return context._coalARoll(sale);};
    var coalBRollF = function(sale) {return context._coalBRoll(sale);};
    var goldRollF = function(sale) {return context._goldRoll(sale);};
    var silverRollF = function(sale) {return context._silverRoll(sale);};
    var copperRollF = function(sale) {return context._copperRoll(sale);};
    this._priceCharts = [
        new PriceChart(0, Silverton.LumberChart, lumberRollF, Silverton.LumberChange, 'Denver', 1, 7, 4, 10),
        new PriceChart(1, Silverton.LumberChart, lumberRollF, Silverton.LumberChange, 'Salt Lake', 3, 9, 5, 8),
        //new PriceChart(2, Silverton.LumberChart, lumberRollF, Silverton.LumberChange, 'Pueblo', 1, 7, 4, 8),
        new PriceChart(2, Silverton.LumberChart, lumberRollF, Silverton.LumberChange, 'Pueblo', 1, 7, 4, 6),
        new PriceChart(3, Silverton.LumberChart, lumberRollF, Silverton.LumberChange, 'Santa Fe', 0, 6, 3, 6),
        new PriceChart(4, Silverton.LumberChart, lumberRollF, Silverton.LumberChange, 'El Paso', 1, 7, 4, 8),
        //new PriceChart(5, Silverton.CoalChart, coalARollF, Silverton.CoalChange, 'Denver', 2, 9, 4, 16),
        new PriceChart(5, Silverton.CoalChart, coalARollF, Silverton.CoalChange, 'Denver', 2, 9, 5, 16),
        //new PriceChart(6, Silverton.CoalChart, coalARollF, Silverton.CoalChange, 'Salt Lake', 0, 7, 5, 10),
        new PriceChart(6, Silverton.CoalChart, coalARollF, Silverton.CoalChange, 'Salt Lake', 0, 7, 4, 10),
        //new PriceChart(7, Silverton.CoalChart, coalBRollF, Silverton.CoalChange, 'Pueblo', 0, 6, 4, 8),
        new PriceChart(7, Silverton.CoalChart, coalBRollF, Silverton.CoalChange, 'Pueblo', 0, 6, 3, 8),
        //new PriceChart(8, Silverton.CoalChart, coalBRollF, Silverton.CoalChange, 'Santa Fe', 1, 8, 3, 8),
        new PriceChart(8, Silverton.CoalChart, coalBRollF, Silverton.CoalChange, 'Santa Fe', 1, 8, 4, 8),
        //new PriceChart(9, Silverton.CoalChart, coalBRollF, Silverton.CoalChange, 'El Paso', 2, 9, 4, 8),
        new PriceChart(9, Silverton.CoalChart, coalBRollF, Silverton.CoalChange, 'El Paso', 2, 9, 5, 8),
        new PriceChart(10, Silverton.GoldChart,   goldRollF, Silverton.GoldChange, 'All', 0, 9, 4, null),
        //new PriceChart(11, Silverton.SilverChart, silverRollF, Silverton.SilverChange, 'All', 0, 9, 5, null),
        //new PriceChart(12, Silverton.CopperChart, copperRollF, Silverton.CopperChange, 'All', 0, 9, 4, null)
        new PriceChart(11, Silverton.SilverChart, silverRollF, Silverton.SilverChange, 'All', 0, 9, 4, null),
        new PriceChart(12, Silverton.CopperChart, copperRollF, Silverton.CopperChange, 'All', 0, 9, 5, null)
    ];
};

Silverton.prototype._makePriceDisplay = function(idx, priceChart)
{

    // the price display and its header
    var priceDisplay = dd_makeDiv('chart'+idx, 'priceDisplay');
    var header = this._makeLabeledDiv(null, 'headerDiv', priceChart.chart[10]);
    $(priceDisplay).append(header);

    // the table of display elements
    var elements = [
        this._makeLabeledDiv(null, 'labelDiv',"At:"),
        this._makeLabeledDiv(null, 'valueDiv',priceChart.location),
        this._makeLabeledDiv(null, 'labelDiv',"Price:"),
        this._makeLabeledDiv(null, 'valueDiv priceMarker',priceChart.chart[priceChart.index]),
        this._makeLabeledDiv(null, 'labelDiv',"Sold:"),
        this._makeLabeledDiv(null, 'valueDiv soldMarker',0)
    ];
    var et = dd_buildTable(null, null, elements, 2);
    $(priceDisplay).append(et);

    // the history
    $(priceDisplay).append(dd_makeDiv(null, 'history'));

    var context = this;
    var touchHandler = function(event) {context.touchPrice(event, idx);};
    $(priceDisplay).bind(IpadTouchEvent, touchHandler);

    var priceDisplayWrapper = dd_makeDiv(null, 'priceDisplayWrapper');
    $(priceDisplayWrapper).append(priceDisplay);

    return priceDisplayWrapper;
};

Silverton.prototype._makeLabeledDiv = function(id, className, label)
{
    var div = dd_makeDiv(id, className);
    $(div).html(label);
    return div;
};

Silverton.prototype.touchBackground = function(event)
{
    if (event && (event.target.id === 'turnConfigure' || event.target.id === 'indexConfigure')) {
        // avoid deselecting when we get a touch in these input fields
        return;
    }
    if (this._selected !== null) {
        this._showSelect(this._selected, false);
        this._selected = null;
    }
};

Silverton.prototype.touchPrice = function(event, idx)
{
    kwstop(event);
    if (this._selected !== null) {
        this._showSelect(this._selected, false);
    }
    this._showSelect(idx, true);
    this._selected = idx;
};

// enter a sale into a particular price chart
Silverton.prototype.enter = function(buttn)
{
    var amount = buttn.enterValue;
    var chart = this._priceCharts[this._selected];
    chart.enter(amount);
};

// clear the latest sale from a price chart
Silverton.prototype.clear = function()
{
    var chart = this._priceCharts[this._selected];
    chart.clear();
};

Silverton.prototype._showSelect = function(idx, select)
{
    var element = document.getElementById('chart'+idx).parentNode;
    if (select) {
        $(element).addClass('priceDisplayHighlight');
        $('#entryCalc').show();
    }
    else {
        $(element).removeClass('priceDisplayHighlight');
        $('#entryCalc').hide();
    }
};

Silverton.prototype._goldRollOld = function(sale)
{
    return this._dice(6,1) + Math.floor(sale/4);
};

Silverton.prototype._goldRoll = function(sale)
{
    return this._dice(6,1) + sale;
};

Silverton.prototype._silverRollOld = function(sale)
{
    return this._dice(6,2) + sale - Silverton.IDN[this._turn];
};

Silverton.prototype._silverRoll = function(sale)
{
    return this._dice(6,2) + sale*2 - Silverton.IDN[this._turn];
};

Silverton.prototype._copperRoll = function(sale)
{
    return this._dice(6,1) + sale;
};

Silverton.prototype._lumberRoll = function(sale)
{
    return this._dice(6,2) + sale - Silverton.IDN[this._turn];
};

Silverton.prototype._coalARoll = function(sale)
{
    return this._dice(6,2) + Math.floor(sale/2) - Silverton.IDN[this._turn];
};

Silverton.prototype._coalBRoll = function(sale)
{
    return this._dice(6,2) + sale - Silverton.IDN[this._turn];
};

Silverton.prototype._dice = function(nSides, nDice)
{
    var sum = 0;
    for (var ii=0; ii<nDice; ii++) {
        sum += (1 + Math.floor(Math.random()*nSides));
    }
    return sum;
};

function PriceChart(idx, chart, rollF, changes, location, minIndex, maxIndex, startIndex, maxSale)
{
    this.idx = idx;  // index, used to construct DOM id
    this.chart = chart;  // price chart
    this.rollF = rollF;  // dice roll function
    this.changes = changes;   // price change for roll
    this.location = location; // name of the location
    this.minIndex = minIndex; // minimum price chart index
    this.maxIndex = maxIndex; // maximum price chart index
    this.index = startIndex;  // price chart start index
    this.maxSale = maxSale;   // max sale per player (or null if no max)

    this.totalSold = 0;
    this.sales = [];
}

PriceChart.prototype.enter = function(amount)
{
    this.totalSold += amount;
    this.sales.push(amount);

    var chartDisplay = $('#chart'+this.idx);
    var soldElement = chartDisplay.find('.soldMarker');
    soldElement.html(this.totalSold);

    // make an accounting entry
    var history = chartDisplay.find('.history');
    var entry = dd_makeDiv(null, 'saleEntry');
    $(entry).html(amount);
    history.append(entry);
};

// remove the most recent sale
PriceChart.prototype.clear = function()
{
    if (this.sales.length == 0) {
        return;
    }

    // decrement the sale
    this.totalSold -= this.sales.pop();
    var chartDisplay = $('#chart'+this.idx);
    var soldElement = chartDisplay.find('.soldMarker');
    soldElement.html(this.totalSold);

    // remove from the history display
    var historyChildren = chartDisplay.find('.history').children();
    historyChildren.last().remove();
};

PriceChart.prototype.turnEnd = function()
{
    // calculate the new price index
    var roll = this.rollF(this.totalSold);
    if (roll < 0) {
        roll = 0;
    }
    else if (roll > this.changes.length-1) {
        roll = this.changes.length-1;
    }

    var oldIndex = this.index;
    var change = this.changes[roll];
    var index = this.index + this.changes[roll];
    this.setIndex(index);
    
    // reset sold to zero
    var chartDisplay = $('#chart'+this.idx);
    var soldElement = chartDisplay.find('.soldMarker');
    soldElement.html(0);
    this.totalSold = 0;
};

PriceChart.prototype.setIndex = function(index)
{
    this.index = index;
    if (this.index < this.minIndex) {
        this.index = this.minIndex;
    }
    if (this.index > this.maxIndex) {
        this.index = this.maxIndex;
    }

    // clear the history
    var chartDisplay = $('#chart'+this.idx);
    var history = chartDisplay.find('.history');
    history.html();
    this.sales = [];

    // show the new price
    var priceElement = chartDisplay.find('.priceMarker');
    priceElement.html(this.chart[this.index]);

};

