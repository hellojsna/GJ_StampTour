//
//  kiosk.js
//  GJ_StampTour
//
//  Created by Js Na on 2025/12/19.
//  Copyright © 2025 Js Na. All rights reserved.
//

function eById(id) {
    return document.getElementById(id);
}
var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

let screenSaverTimeout;
const screenSaverDelay = 60000; // 1분
function activateScreenSaver() {
    setTimeout(function () {
        eById("ScreenSaver").style.display = "flex";
    }, 10);
}
function deactivateScreenSaver() {
    eById("ScreenSaver").style.display = "none";
    resetScreenSaverTimer();
}
function resetScreenSaverTimer() {
    if (screenSaverTimeout) {
        clearTimeout(screenSaverTimeout);
    }
    screenSaverTimeout = setTimeout(activateScreenSaver, screenSaverDelay);
}
function setupScreenSaver() {
    document.addEventListener("click", deactivateScreenSaver);
    document.addEventListener("touchstart", deactivateScreenSaver);
    resetScreenSaverTimer();
}

var kiosk_stamp_id = "591DC6BF-BFF6-466F-952E-07655A53C78D"; // 테스트용 스탬프 ID, 실제 운영 시 서버에서 할당 필요.

function handleScan(data) {
    // MARK: 스캔한 데이터 처리
    // FIXME: 백엔드에서 GET으로 안 바꿔줘서 어쩔 수 없이 xhr 사용해서 POST함.
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "/stamp/issue", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            try {
                console.log("QR 코드 스캔 처리 결과:", res);
                if (res.status == "success") {
                    kioskScanFeedback("success");
                } else if (res.status == "already") {
                    kioskScanFeedback("already");
                } else {
                    console.log("오류");
                    kioskScanFeedback("fail");
                }
            } catch (e) {
                console.error("코드 처리 중 예외 발생:", e);
                kioskScanFeedback("fail");
            }
        } else {
            alert(`서버와 통신을 실패했습니다. 다시 시도해 주세요.`);
            kioskScanFeedback("fail");
        }
    };
    xhr.send(`{ "otp": "${data}", "stamp_id": "${kiosk_stamp_id}" }`); // 보낼 데이터 지정
}
function setupScanner() {
    let config = {
        fps: 30,
        rememberLastUsedCamera: true,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    };
    let html5Qrcode = new Html5Qrcode("reader", config);
    html5Qrcode.start({ facingMode: "environment" }, config, function (result) {
        // MARK: QR 코드 스캔 성공
        handleScan(result);
    });
}

var isSoundMuted = false;
function kioskScanFeedback(type) {
    function playSound(sound) { // iOS WebKit 및 일부 브라우저 호환성 처리 필요함.
        if (isSoundMuted) return;
        const soundMap = {
            success: "/sounds/Kiosk_success.mp3",
            already: "/sounds/Kiosk_alert.mp3",
            fail: "/sounds/Kiosk_alert.mp3",
        };
        const src = soundMap[sound];
        playSound.cache = playSound.cache || {};
        let audio = playSound.cache[src];
        if (!audio) {
            audio = new Audio(src);
            audio.preload = "auto";
            audio.playsInline = true;
            playSound.cache[src] = audio;
        } else {
            audio.pause();
            audio.currentTime = 0;
        }

        const tryPlay = function () {
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.then === "function") {
                playPromise.catch(function () {
                    const unlock = function () {
                        audio.play();
                    };
                    window.addEventListener("touchstart", unlock, { once: true, passive: true });
                    window.addEventListener("click", unlock, { once: true });
                });
            }
        };

        tryPlay();
    }
    eById("ScannerImage").classList.add(type);
    switch (type) {
        case "success":
            eById("ScanResult").innerText = "방문 인증 완료.\n홍길동님, 환영합니다.";
            playSound("success");
            break;
        case "already":
            eById("ScanResult").innerText = "이미 처리되었습니다.";
            playSound("already");
            break;
        default:
            eById("ScanResult").innerText = "인증 실패. 다시 시도해주세요.";
            playSound("fail");
            break;
    }
    setTimeout(function () {
        eById("ScannerImage").classList.remove(type);
    }, 1000);
}

function setupControlPanel() {
    eById("Control-SetScanData").addEventListener("click", function () {
        kiosk_stamp_id = eById("Control-stampID").value;
        const simulatedData = eById("Control-scanData").value;
        handleScan(simulatedData);
    });
    eById("Control-MuteToggle").addEventListener("change", function () {
        isSoundMuted = eById("Control-MuteToggle").checked;
    });
    eById("Control-TriggerScreenSaver").addEventListener("click", function () {
        activateScreenSaver();
    });
    eById("Control-ScanSuccess").addEventListener("click", function () {
        kioskScanFeedback("success");
    });
    eById("Control-ScanAlready").addEventListener("click", function () {
        kioskScanFeedback("already");
    });
    eById("Control-ScanFail").addEventListener("click", function () {
        kioskScanFeedback("fail");
    });
}
setupScreenSaver();

setupScanner();
setupControlPanel();
