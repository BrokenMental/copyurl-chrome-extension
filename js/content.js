/*
 ==============================================
 COPY URL - Chrome Extension
 ----------------------------------------------
 github.com/dvdyakonov/copyurl-chrome-extension
 ----------------------------------------------
 Copyright (c) 2014 by Dmitry Dyakonov
 ----------------------------------------------
 All rights reserved.
 ==============================================
*/

function convertUrl(t) {
    t = decodeURIComponent(t).replace(/\s/g, "%20");
    if (t.search('http://') != -1)
        a = 7;
    else
        a = 8;
    domen = t.substring(a);
    domen = domen.split('/');
    result = punycode.ToUnicode(domen[0]);
    t = t.replace(domen[0], result);
    return t;
}

var lastTarget = null;
document.addEventListener('contextmenu', function (event) {
    var node = event.target;
    while (node && node.nodeName.toLowerCase() != 'a') {
        node = node.parentNode;
    }
    lastTarget = node;
}, true);


chrome.extension.onRequest.addListener(function (request, sender, callback) {
    if (request == 'copy') {
        if (lastTarget.href) {
            callback(convertUrl(lastTarget.href));
        } else {
            callback(convertUrl(lastTarget.src));
        }
    }
});
