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

var manifest = chrome.runtime.getManifest();
var time = 300;

// if (localStorage["version"] == null) {
// setTimeout(function(){
//     var options = {
//         type: "basic",
//         title: chrome.i18n.getMessage("name"),
//         message: chrome.i18n.getMessage("notify_text"),
//         iconUrl: "/img/notify.png"
//     };
//     chrome.notifications.create("", options, function (id) {
//     });
//     localStorage["version"] = manifest.version;
// }, time*1000)
// }

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.status == 'loading') {
        chrome.pageAction.show(tabId);
    }
});

var allowClickProcessing = true;
var clickCount = 0;
var tabCount = 0;
var clickTimer = null;
var tooltipTimer = null;
var iconTimer = null;

chrome.pageAction.onClicked.addListener(function (t) {
    if (allowClickProcessing) {
        clearTimeout(clickTimer);
        clickCount++;
        clickTimer = setTimeout(doCopy, (clickCount > 2 ? 0 : 300), t, clickCount);
    }
});

function doCopy(t, inType) {
    allowClickProcessing = false;
    if (t) {
        chrome.tabs.getAllInWindow(null, function (tabs) {
            buffer_clear();
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].selected) {
                    buffer_appendTabInfo(tabs[i]);
                }
            }

            if (buffer_copyToClipboard()) {
                notifyOK(t, inType);
            } else {
                notifyError(t);
            }
        });
    } else {
        notifyError(t);
    }
}

function buffer_clear() {
    b.value = '';
    tabCount = 0;
}

function buffer_copyToClipboard() {
    if (b.value.length > 0) {
        b.select();
        document.execCommand('copy');
        return true;
    }

    return false;
}

function buffer_appendTabInfo(t) {
    if (b.value.length > 0) {
        b.value += '\n\n';
    }

    b.value += getTabInfoText(t);
    tabCount++;
}

function getTabInfoText(t) {
    t.url = decodeURIComponent(t.url).replace(/\s/g, "%20");
    if (t.url.search('http://') != -1)
        a = 7;
    else
        a = 8;
    domen = t.url.substring(a);
    domen = domen.split('/');
    result = punycode.ToUnicode(domen[0]);
    t.url = t.url.replace(domen[0], result);
    return t.url;

}


function notifyOK(t, inType) {
    clearTimeout(tooltipTimer);
    clearTimeout(iconTimer);

    clickCount = 0;
    allowClickProcessing = true;

    chrome.pageAction.setTitle({
        tabId: t.id,
        title: (inType === 1 ? 'Copied ' + tabCount + ' selected ' + (tabCount === 1 ? 'tab' : 'tabs') : (inType === 2 ? 'Copied ' + tabCount + ' window ' + (tabCount === 1 ? 'tab' : 'tabs') : 'Copied ' + tabCount + ' session ' + (tabCount === 1 ? 'tab' : 'tabs')))
    });
    tooltipTimer = setTimeout(chrome.pageAction.setTitle, 1000, {"tabId": t.id, title: ''});

    chrome.pageAction.setIcon({"tabId": t.id, path: "img/ok.png"});
    iconTimer = setTimeout(chrome.pageAction.setIcon, 5000, {"tabId": t.id, path: "img/copy.png"});
}

function notifyError(t) {
    clickCount = 0;
    allowClickProcessing = true;
    chrome.pageAction.setIcon({"tabId": t.id, path: "img/error.png"});
}

var b = document.getElementById('buffer');


chrome.contextMenus.create(
    {
        "title": chrome.i18n.getMessage("context_title"),
        "contexts": ["image", "link"],
        "onclick": function (info, tab) {
            chrome.tabs.sendRequest(tab.id, 'copy', function (link) {
                var obj = document.getElementById("buffer");

                if (obj) {
                    obj.value = link;
                    obj.select();
                    document.execCommand("copy", false, null);
                }
            });
        }
    });

// chrome.notifications.onClicked.addListener(function (notificationId) {
//     chrome.tabs.create({url: 'https://chrome.google.com/webstore/detail/copy-url/mkhnbhdofgaendegcgbmndipmijhbili/reviews'});
// });

