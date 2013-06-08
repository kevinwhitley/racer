function ipad_updateOrientation()
{
    var orient = (window.innerWidth < 800) ? "portrait" : "landscape";
    document.body.setAttribute("orient", orient);
}

function ipad_isIpad()
{
    var agent = navigator.userAgent;
    var srch = agent.search(/iPad/);
    return srch >= 0;
}

// touch event name
//var IpadTouchEvent = ipad_isIpad() ? 'touchstart' : 'mousedown';
var IpadTouchEvent = 'mousedown';


function ipad_touchDButton(event, buttonId)
{
    kwstop(event);
    // hilite
    $('#'+buttonId).addClass('dbuttonHilite');
    var clearHilite = function() {$('#'+buttonId).removeClass('dbuttonHilite');};
    window.setTimeout(clearHilite, 100);
    return false;
}

function ipad_makeDButton(id, label, action)
{
    var button = dd_makeDiv(id, 'dbutton');
    var buttonId = kwidentify(button);
    var jbuttn = $(button);
    jbuttn.html(label);
    jbuttn.bind(IpadTouchEvent, function(event) {return ipad_touchDButton(event, buttonId);});
    if (action) {
        jbuttn.bind(IpadTouchEvent, action);
        //jbuttn.on(IpadTouchEvent, action);
        //console.log('have action');
    }

    return button;
}

var ipad_modalDiv = null;

function ipad_confirm(msg, bmsgs, callbackF)
{
    if (ipad_modalDiv === null) {
        ipad_modalDiv = ipad_makeModal();
    }

    // set the message
    $(ipad_modalDiv).find('.modalMessage').html(msg);

    // turn on all the needed buttons
    var buttons = $(ipad_modalDiv).find('.modalButton').each(function(ix, el){
        if (ix < bmsgs.length) {
            $(el).css('display', 'inline').html(bmsgs[ix]);
        }
        else {
            $(el).css('display', 'none');
        }
    });

    ipad_modalDiv.callbackF = callbackF;
    ipad_modalDiv.style.display = 'block';
}

function ipad_modalClick(index, event)
{
    kwstop(event);
    ipad_modalDiv.style.display = 'none';
    if (ipad_modalDiv.callbackF) {
        ipad_modalDiv.callbackF(index);
    }
}

function ipad_makeModal()
{
    var modal = dd_makeDiv(null, 'modalBackdrop');
    var dialog = dd_makeDiv(null, 'modalDialog');
    $(modal).append(dialog);
    var message = dd_makeDiv(null, 'modalMessage');
    $(dialog).append(message);
    var buttonBar = dd_makeDiv(null, 'modalButtonBar');
    $(dialog).append(buttonBar);
    for (var ii=0; ii<3; ii++) {
        var bb = dd_makeElement('button', null, 'modalButton');
        $(bb).bind(IpadTouchEvent, _ipad_bindButtonClick(ii));
        $(buttonBar).append(bb);
    }

    $('body').append(modal);
    return modal;
}

function _ipad_bindButtonClick(indx)
{
    return function(){ipad_modalClick(indx, null)};
}
