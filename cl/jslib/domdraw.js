
function dd_positionAbs(element, xx, yy)
{
    $(element).css({position: 'absolute', left: xx, top: yy});
}

function dd_positionAbsBox(element, xx, yy, width, height)
{
    $(element).css({position: 'absolute', left: xx, top: yy, width: width, height: height});
}

function dd_makeDiv(id, cl)
{
    return dd_makeElement('div', id, cl);
}

function dd_makeElement(type, id, cl)
{
    var element = document.createElement(type);

    
    if (id) {
        element.id = id;
    }

    if (cl) {
        element.className = cl;
    }
    return element;
}

function dd_setText(el, txt)
{
    $(el).html(txt);
}

/*
function dd_makeElementArgs(type, args)
{
    // translate "className" to "class" so that the prototype Element call works in WebKit
    if (args['className']) {
        args['class'] = args['className'];
    }
    return new Element(type, args);
}
*/

function dd_makeSelect(id, className, options)
{
    var select = dd_makeElement('select', id, className);
    for (var ii=0; ii<options.length; ii++) {
        var optArg = options[ii];
        var option = dd_makeElement('option');
        option.value =optArg.value;
        if (optArg.selected) {
            option.selected = 1;
        }
        $(option).html(optArg.label);
        $(select).append(option);
    }

    return select;
};

// take an array of elements and put them into an unstyled table
function dd_buildTable(tableId, tableClass, items, itemsPerRow)
{
    var table = dd_makeElement('table', tableId, tableClass);
    var nRows = items.length / itemsPerRow;  // we chop off odd items
    for (var row=0; row<nRows; row++) {
        var tr = dd_makeElement('tr');
        $(table).append(tr);
        for (var ii=0; ii<itemsPerRow; ii++) {
            var td = dd_makeElement('td');
            $(tr).append(td);
            $(td).append(items[row*itemsPerRow + ii]);
        }
    }

    return table;
}
