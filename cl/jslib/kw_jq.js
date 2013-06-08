
function getUrlParameter (url, param)
{
    var indx = url.indexOf(param+"=");
    var result = null;
    if (indx >= 0) {
        indx += param.length + 1;
        var end = url.indexOf('&', indx+1);
        if (end >= 0) {
            result = url.substring(indx, end);
        }
        else {
            result = url.substring(indx);
        }
    }
    return result;
}

function kw_ajaxForm(formId, responseFunction)
{
    var jForm = $('#'+formId);
    kw_ajaxPost(jForm.attr('action'), jForm.serialize(), responseFunction);
}

function kw_ajaxGet(url, data, responseFunction, errorFunction)
{
    var standardActions = function(response)
    {
        //alert("kw_ajaxGet " + response.action);
        if (response.action == 'redirect') {
            window.location = response.url;
        }
        else if (response.action == 'json') {
            responseFunction(response.data);
        }
        else if (responseFunction) {
            responseFunction(response);
        }
    }
    
    var options = {
        method: 'GET',
        dataType: 'json',
        data: data,
        success: standardActions,
        error: errorFunction || null
    };
    //alert("calling ajax " + url);
    $.ajax(url, options);
}

function kw_ajaxGetRawJson(url, data, responseFunction, errorFunction)
{
    var options = {
        method: 'GET',
        dataType: 'json',
        data: data,
        success: responseFunction,
        error: errorFunction || null
    };
    $.ajax(url, options);
}

function kw_ajaxPost(url, parameters, responseFunction)
{
    var standardActions = function(response)
    {
        if (response.action == 'redirect') {
            window.location = response.url;
        }
        else if (response.action == 'json') {
            responseFunction(response.data);
        }
        else {
            responseFunction(response);
        }
    }

    var onFailure = function(xmlhttp, status, errorThrown)
    {
        alert("kw_ajaxPost failure! " + status);
        if (errorThrown) {
            alert("exception: " + errorThrown);
        }
    };

    var options = {
        type: 'POST',
        dataType: 'json',
        data: parameters,
        success: standardActions,
        error: onFailure
    };
    $.ajax(url, options);
}

// construct a url based on a location (/whatever) and parameters (in a map)
// this routine does the parameter escaping, and sorts parameters alphabetically
// returns the url string
function kw_constructUrl(location, parameters)
{
    var url = location;
    var first = true;
    var parameterNames = [];
    for (var pp in parameters) {
        if (parameters.hasOwnProperty(pp)) {
            parameterNames.push(pp);
        }
    }
    parameterNames.sort();

    for (var ii=0; ii<parameterNames.length; ii++) {
        pp = parameterNames[ii];
        var val = parameters[pp];
        if (first) {
            url += '?';
            first = false;
        }
        else {
            url += '&';
        }
        url += pp + '=' + encodeURIComponent(val);
    }

    return url;
}

function kw_readCookie(cname)
{
    var allcookies = document.cookie;
    var start = allcookies.indexOf(cname+"=");
    if (start < 0) {
        return null;
    }
    start += cname.length + 1;
    var end = allcookies.indexOf(";", start);
    var cookieString = (end < 0) ? allcookies.substring(start) : allcookies.substring(start,end);
    if (cookieString.charAt(0) != 'a') {
        // not our encoding version
        return null;
    }
    cookieString = decodeURIComponent(cookieString.substring(1));

    var result = {};
    var tokens = cookieString.split(";");
    for (var ii=0; ii<tokens.length; ii++) {
        var indx = tokens[ii].indexOf("=");
        if (indx < 1) {
            continue;
        }
        var key = tokens[ii].substring(0, indx);
        var val = tokens[ii].substring(indx+1);
        result[key] = val;
    }

    return result;
}

function kw_setCookie(name, value, seconds)
{
    var cookieValue = "a"; // our version mark
    for (var prop in value) {
        cookieValue += prop + "=" + value[prop] + ";";
    }
    cookieValue = encodeURIComponent(cookieValue);

    var expire = "";
    if (seconds) {
        var date = new Date();
        date.setTime(date.getTime() + seconds*1000);
        expire = "; expires="+date.toGMTString();
    }

    var wr = name+"="+cookieValue+expire+"; path=/";
    document.cookie = wr;
}

// trivial templating engine
function KwTemplate(template)
{
    this.template = template;
}

KwTemplate.prototype.evaluate = function(values)
{
    var result = this.template;
    var key;
    for (key in values) {
        if (values.hasOwnProperty(key)) {
            var expr = new RegExp("#{"+key+"}", "g");
            result = result.replace(expr, values[key]);
        }
    }

    return result;
};

// stop an event - either a jQuery normalized event, or an event from a DOM element
function kwstop(event)
{
    if (event) {
        if (event.originalEvent || event.preventDefault) {
            // this is a jQuery event object or standard DOM event object
            event.preventDefault();
            event.stopPropagation();
        }
        else {
            // a native IE event object
            event.cancelBubble = true;
            event.returnValue = false;
        }
    }
}

// get the position of a mouse event, relative to an element
// event is assumed to be a jQuery normalized event
// element is something we can wrap jQuery around
function kwmousePosition(event, element)
{
    var offset = jQuery(element).offset();
    return {left: event.pageX - offset.left, top: event.pageY - offset.top};
}

function kwidentify(domelement)
{
    var id = $(domelement).attr('id');
    if (!id) {
        id = 'autoId'+ (kwidentify.counter++);
        $(domelement).attr('id', id);
    }
    return id;
}
kwidentify.counter = 0;


function kwel(id)
{
    return document.getElementById(id);
}

