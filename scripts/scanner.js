function eById(id) {
    return document.getElementById(id);
}
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
  };
function setupScanner() {
    let config = {
        fps: 30,
        rememberLastUsedCamera: true,
        formatsToSupport: [Html5QrcodeSupportedFormats.DATA_MATRIX],
    };
    let html5Qrcode = new Html5Qrcode("reader", config);
    html5Qrcode.start({ facingMode: "environment" }, config, function (result) {
        if (result.startsWith("S")) {
            let sI = Number(result.replace("S", ""));
            if (!isNaN(sI)) {
                eById("ScannerImage").src = "/images/Scanner_success.png";
                window.location.href = `/check?s=${sL[sI - 1].stampId}`;
                html5Qrcode.pause();
            }
        }
    });
}
let sL;
getJSON(`/api/stampList.json`, function (err, data) {
    if (err != null) {
        alert("스탬프 목록 데이터를 불러오는 중 오류가 발생했습니다.");
    } else if (data !== null) {
        sL = data.stampList;
        setupScanner()
    }
});