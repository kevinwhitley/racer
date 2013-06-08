function VenusCalc()
{
    this._numberId = 'number';
    this._priceId = 'price';
    this._playerPayId = 'playerpay';
    this._sPayId = 'spay';
    this._fPayId = 'fpay';
    this._accountingId = 'accounting';
    this._factoryButtonId = 'factoryBuy';

    this._reset(true);
}

VenusCalc.prototype.draw = function()
{
    var cnt = $('#bigdiv');
    var context = this;

    // the number buttons
    cnt.append(this._makeButton(null, 10,  90, 48, 1, function(){context.addDigit(1);}));
    
    cnt.append(this._makeButton(null, 10,  90, 48, 1, function(){context.addDigit(1);}));
    cnt.append(this._makeButton(null, 70,  90, 48, 2, function(){context.addDigit(2);}));
    cnt.append(this._makeButton(null,130,  90, 48, 3, function(){context.addDigit(3);}));
    cnt.append(this._makeButton(null, 10, 150, 48, 4, function(){context.addDigit(4);}));
    cnt.append(this._makeButton(null, 70, 150, 48, 5, function(){context.addDigit(5);}));
    cnt.append(this._makeButton(null,130, 150, 48, 6, function(){context.addDigit(6);}));
    cnt.append(this._makeButton(null, 10, 210, 48, 7, function(){context.addDigit(7);}));
    cnt.append(this._makeButton(null, 70, 210, 48, 8, function(){context.addDigit(8);}));
    cnt.append(this._makeButton(null,130, 210, 48, 9, function(){context.addDigit(9);}));
    cnt.append(this._makeButton(null, 10, 270, 110, 0, function(){context.addDigit(0);}));

    // non-number buttons
    cnt.append(this._makeButton(null, 130, 270, 48, '@', function(){context.at();}));
    cnt.append(this._makeButton(null, 190, 90, 170, 'buy', function(){context.buy();}));
    cnt.append(this._makeButton('factoryBuy', 190, 150, 170, 'buy (factory)', function(){context.buyf();}));
    cnt.append(this._makeButton(null, 190, 210, 170, 'sell', function(){context.sell();}));
    cnt.append(this._makeButton(null, 190, 270, 170, 'clear', function(){context.clear();}));
    cnt.append(this._makeButton(null, 340, 330, 230, 'Done', function(){context.done();}));

    // station select
    var select = dd_makeSelect('stationChoice', 'standardSelect',
        [{value:'', label:'No station', selected:true},
         {value:'player', label:'Player owns station'},
         {value:'s', label:'S owns station'}]);
    $(select).bind('change', function() {context.stationChoice();});
    var div = dd_makeDiv();
    dd_positionAbsBox(div, 10, 330, 240, 30);
    $(div).append(select);
    cnt.append(div);

    // factory select
    select = dd_makeSelect('factoryChoice', 'standardSelect',
        [{value:'', label:'No factory', selected:true},
         {value:'player', label:'Player owns factory'},
         {value:'s', label:'S owns factory'},
         {value:'f', label:'F owns factory'}]);
    $(select).bind('change', function() {context.factoryChoice();});
    div = dd_makeDiv();
    dd_positionAbsBox(div, 10, 370, 240, 30);
    $(div).append(select);
    cnt.append(div);

    // labeled boxes
    cnt.append(this._makeLabeledDiv('numberbox', 'number',90, 10, 90, 30, '#:', null));
    cnt.append(this._makeLabeledDiv('pricebox', 'price',90, 50, 90, 30, '@:', null));
    cnt.append(this._makeLabeledDiv('playerbox', 'playerpay',  450, 210, 80, 25, 'Player:', '0'));
    cnt.append(this._makeLabeledDiv('sbox', 'spay',  450, 250, 80, 25, 'S:', '0'));
    cnt.append(this._makeLabeledDiv('fbox', 'fpay',  450, 290, 80, 25, 'F:', '0'));

    // accounting
    var accountingBox = dd_makeDiv('accountingbox', null);
    dd_positionAbsBox(accountingBox, 370, 10, 192, 200);
    div = dd_makeDiv();
    $(div).css('paddingLeft', 3).html('Accounting');
    $(accountingBox).append(div);
    var accounting = dd_makeDiv('accounting', null);
    $(accounting).css({overflow:'auto', border:'1px solid black'});
    dd_positionAbsBox(accounting, 4, 30, 186, 164);
    $(accountingBox).append(accounting);
    cnt.append(accountingBox);
};

/*
    <div id="stationChoiceBox" style="position:absolute;left:10px;top:330px;width:240px;height:30px">
*/

/*
VenusCalc.prototype._makeSelect = function(selectArgs, options)
{
    var select = dd_makeElementArgs('select', selectArgs);
    for (var ii=0; ii<options.length; ii++) {
        var optArg = options[ii];
        var option = new Element('option', {value:optArg.value});
        if (optArg.selected) {
            option.selected = 1;
        }
        option.update(optArg.label);
        select.insert(option);
    }

    return select;
};
*/

VenusCalc.prototype._makeButton = function(id, left, top, width, text, action)
{
    var button = ipad_makeDButton(id, text, action);
    dd_positionAbsBox(button, left, top, width, 48);
    return button;
};

VenusCalc.prototype._makeLabeledDiv = function(outerId, innerId, left, top, width, height, label, initialText)
{
    var outerDiv = dd_makeDiv(outerId, null);
    dd_positionAbsBox(outerDiv, left, top, width, height);
    $(outerDiv).html(label);
    var innerDiv = dd_makeDiv(innerId, null);
    $(innerDiv).css({position:'absolute', left:'30', top:'0', right:'0', bottom:'0', textAlign:'right'});
    if (initialText) {
        $(innerDiv).html(initialText);
    }
    $(outerDiv).append(innerDiv);

    return outerDiv;
};

VenusCalc.prototype._reset = function(initial)
{
    // the current buy-sell
    this._number = 0;
    this._price = 0;
    this._settingPrice = false;

    // total to player
    this._player = 0;
    // total to station owner
    this._stationMode = "";
    this._station = 0;
    // total to factory owner
    this._factoryMode = "";
    this._factory = 0;

    if (!initial) {
        $('#stationChoice')[0].selectedIndex = 0;
        $('#factoryChoice')[0].selectedIndex = 0;
    }
};

VenusCalc.prototype.addDigit = function(digit)
{
    if (this._settingPrice) {
        this._price = this._price * 10 + digit;
    }
    else {
        this._number = this._number * 10 + digit;
    }
    this.display();
};

VenusCalc.prototype.display = function()
{
    $('#'+this._numberId).html(this._number);
    $('#'+this._priceId).html(this._price);

    var player = this._player;
    if (this._stationMode == 'player') {
        player += this._station;
    }
    if (this._factoryMode == 'player') {
        player += this._factory;
    }
    $('#'+this._playerPayId).html(player);

    var station = this._station;
    if (this._factoryMode == 's') {
        station += this._factory;
    }
    $('#'+this._sPayId).html(station);
    
    $('#'+this._fPayId).html(this._factory);

    if (this._stationMode != 's') {
        $('#sbox')[0].style.display = 'none';
    }
    else {
        $('#sbox')[0].style.display = 'block';
    }
    
    if (this._factoryMode.length > 0) {
        $('#'+this._factoryButtonId)[0].style.display = 'block';
    }
    else {
        $('#'+this._factoryButtonId)[0].style.display = 'none';
    }
    if (this._factoryMode == 'f') {
        $('#fbox')[0].style.display = 'block';
    }
    else {
        $('#fbox')[0].style.display = 'none';
    }
};

VenusCalc.prototype.at = function()
{
    this._settingPrice = true;
};

VenusCalc.prototype.buy = function()
{
    this._accounting("buy " + this._number + " @ " + this._price);
    var sale = this._number * this._price;
    this._number = 0;
    this._price = 0;
    this._settingPrice = false;
    this._player -= sale;
    this._station += sale/10;
    this.display();
};

VenusCalc.prototype.buyf = function()
{
    this._accounting("buyf " + this._number + " @ " + this._price);
    var sale = this._number * this._price;
    this._number = 0;
    this._price = 0;
    this._settingPrice = false;
    this._player -= sale;
    this._station += sale/10;
    this._factory += sale/2;
    this.display();
};

VenusCalc.prototype.sell = function()
{
    this._accounting("sell " + this._number + " @ " + this._price);
    var sale = this._number * this._price;
    this._number = 0;
    this._price = 0;
    this._settingPrice = false;
    this._player += sale;
    this._station += sale/10;
    this.display();
};

VenusCalc.prototype.clear = function()
{
    this._number = 0;
    this._price = 0;
    this._settingPrice = false;
    this.display();
};

VenusCalc.prototype.done = function()
{
    this._reset(false);
    this.display();
    $('#'+this._accountingId).empty();
};

VenusCalc.prototype._accounting = function(msg)
{
    var accElement = $('#'+this._accountingId);
    var entry = dd_makeDiv(null, 'accountEntry');
    $(entry).html(msg);
    accElement.append(entry);
};

VenusCalc.prototype.stationChoice = function()
{
    var mode = $('#stationChoice').val();
    this._stationMode = mode;
    this.display();
};

VenusCalc.prototype.factoryChoice = function()
{
    var mode = $('#factoryChoice').val();
    this._factoryMode = mode;
    this.display();
};
