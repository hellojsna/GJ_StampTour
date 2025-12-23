function eById(id) {
    return document.getElementById(id);
}
function eByCl(cl) {
    return document.getElementsByClassName(cl);
}
function setCookie(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';expires=' + date.toUTCString() + ';path=/; ';
}
function getCookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value ? value[2] : null;
}

function checkStamp(stampId) {
    let stampJSON = getCookie("LocalStamp");
    console.log(stampJSON);
    if (stampJSON == null) {
        // new array
        console.log("new array");
        let stampList = [stampId];
        console.log(stampList);
        console.log(JSON.stringify(stampList));
        setCookie("LocalStamp", JSON.stringify(stampList), 7);
    } else {
        // append
        console.log("append");
        stampJSON = decodeURIComponent(stampJSON);
        let stampList = JSON.parse(stampJSON);
        stampList.push(stampId);
        setCookie("LocalStamp", JSON.stringify(stampList), 7);
    }
}
