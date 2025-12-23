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

// Cookie helpers (replaced per request)
function setCookie(name, value, exp) {
    var date = new Date();
    date.setTime(date.getTime() + exp * 24 * 60 * 60 * 1000);
    document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';expires=' + date.toUTCString() + ';path=/; ';
}
function getCookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value ? value[2] : null;
}
function deleteCookie(name) {
    document.cookie = encodeURIComponent(name) + '=;expires=Thu, 01 JAN 1999 00:00:10 GMT;';
}

let programmingCafeId = ""; // 프로그래밍부 부스 ID (자동 탐지)
let kiosk_stamp_name = ""; // 선택된 스탬프 이름
let kiosk_stamp_location = ""; // 선택된 스탬프 위치
let stampList = []; // 로드된 스탬프 목록

let screenSaverTimeout;
let isScreenSaverActive = false;
const screenSaverDelay = 60000; // 1분
function activateScreenSaver() {
    setTimeout(function () {
        eById("ScreenSaver").style.display = "flex";
        isScreenSaverActive = true;
        pauseScanner();
    }, 10);
}
function deactivateScreenSaver() {
    eById("ScreenSaver").style.display = "none";
    isScreenSaverActive = false;
    resumeScanner();
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

function updateScreenSaverStamp(name, location) {
    const nameEl = document.querySelector('#StartGuide .StampName');
    const locEl = document.querySelector('#StartGuide .StampLocation');
    if (nameEl) nameEl.innerText = name || '정보 없음';
    if (locEl) locEl.innerText = location || '정보 없음';
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
                const res = xhr.response;
                console.log("QR 코드 스캔 처리 결과:", res);
                if (res.status == "success") {
                    kioskScanFeedback("success", res.user_name);
                    if (kiosk_stamp_id == programmingCafeId) {
                        setTimeout(() => {
                            window.location.href = `http://210.91.63.199:5000/?student_id=${res.user_name.replace(/[^0-9]/g, "").slice(-5)}`;
                        }, 1000);
                    }
                }
            } catch (e) {
                console.error("코드 처리 중 예외 발생:", e);
                kioskScanFeedback("fail");
            }
        } else {
            // 이미 쓴 거 400 리턴
            //alert(`서버와 통신을 실패했습니다. 다시 시도해 주세요.`);
            kioskScanFeedback("fail");
        }
    };
    xhr.send(JSON.stringify({ otp: String(data), stamp_id: String(kiosk_stamp_id), stamp_name: String(kiosk_stamp_name || "") })); // 보낼 데이터 지정
}
let html5Qrcode = null;
let scanLocked = false;
let selectedCameraId = null;
let scannerRunning = false;

const scannerConfig = {
    fps: 30,
    rememberLastUsedCamera: true,
    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
};

function setupScanner() {
    if (!html5Qrcode) {
        html5Qrcode = new Html5Qrcode("reader", scannerConfig);
    }
    startScanner();
}

function startScanner() {
    if (!html5Qrcode) return;
    if (scannerRunning) return;
    const startTarget = selectedCameraId || { facingMode: "environment" };
    html5Qrcode.start(startTarget, scannerConfig, function (result) {
        if (scanLocked) return;
        scanLocked = true;
        handleScan(result);
        setTimeout(function () {
            scanLocked = false;
        }, 7000);
    }).then(function () {
        scannerRunning = true;
    }).catch(function (e) {
        console.error("스캐너 시작 실패:", e);
    });
}

function stopScanner() {
    if (!html5Qrcode || !scannerRunning) return Promise.resolve();
    return html5Qrcode.stop().then(function () {
        scannerRunning = false;
    }).catch(function (e) {
        console.error("스캐너 중지 실패:", e);
    });
}

function pauseScanner() {
    stopScanner();
}

function resumeScanner() {
    if (!scannerRunning) {
        startScanner();
    }
}

var isSoundMuted = false;
function kioskScanFeedback(type, user_name) {
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
            eById("ScanResult").innerText = `방문 인증 완료.\n${user_name}님, 환영합니다.`;
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
    setupCameraSelector();
    eById("Control-SetScanData").addEventListener("click", function () {
        const simulatedData = eById("Control-scanData").value;
        handleScan(simulatedData);
    });
    eById("Control-MuteToggle").addEventListener("change", function () {
        isSoundMuted = eById("Control-MuteToggle").checked;
    });
    eById("Control-TriggerScreenSaver").addEventListener("click", function () {
        activateScreenSaver();
    });
    const fullscreenButton = eById("Control-Fullscreen");
    fullscreenButton.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            (document.documentElement.requestFullscreen || document.body.requestFullscreen).call(document.documentElement);
        } else {
            document.exitFullscreen && document.exitFullscreen();
        }
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

    // 초기 표시 상태: 쿠키에 선택 없으면 표시, 있으면 숨김
    const cp = eById("ControlPanel");
    const hasBoothCookie = !!getCookie('kiosk_stamp_id');
    if (cp) cp.style.display = hasBoothCookie ? 'none' : 'block';

    // 상단 타이틀 더블 클릭/탭으로 표시/숨김
    setupTitleToggle();
}

// 사용 가능한 카메라를 가져와 선택할 수 있도록 구성
function setupCameraSelector() {
    const camSelector = eById("Control-cameraSelector");
    if (!camSelector || !Html5Qrcode || !Html5Qrcode.getCameras) return;

    Html5Qrcode.getCameras().then(function (devices) {
        camSelector.innerHTML = '';
        devices.forEach(function (d) {
            var opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.label || ("Camera " + (camSelector.options.length + 1));
            camSelector.appendChild(opt);
        });
        // 선택 변경 시 재시작
        camSelector.addEventListener('change', function () {
            selectedCameraId = camSelector.value || null;
            stopScanner().then(function () {
                startScanner();
            });
        });
    }).catch(function (e) {
        console.error('카메라 목록을 가져오지 못했습니다:', e);
    });
}

// 스탬프 목록을 가져와 선택할 수 있도록 구성
function setupStampInformation() {
    const selector = eById("Control-stampSelector");
    if (!selector) return;

    getJSON('/api/stampList.json', function (err, data) {
        if (err) {
            console.error('스탬프 목록을 불러오지 못했습니다:', err);
            return;
        }
        try {
            stampList = (data && data.stampList) ? data.stampList : [];
            // 프로그래밍부 스탬프 ID 자동 감지
            const prog = stampList.find(function (s) { return s.stampName === '프로그래밍부'; });
            if (prog) programmingCafeId = prog.stampId;

            // 드롭다운 옵션 생성
            selector.innerHTML = '';
            var placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = '스탬프 선택';
            placeholder.disabled = true;
            placeholder.selected = true;
            selector.appendChild(placeholder);

            stampList.forEach(function (s) {
                var opt = document.createElement('option');
                opt.value = s.stampId;
                opt.textContent = s.stampName + (s.stampLocation ? (' — ' + s.stampLocation) : '');
                opt.dataset.stampName = s.stampName;
                selector.appendChild(opt);
            });

            // 쿠키에서 선택 복원
            const savedId = getCookie('kiosk_stamp_id');
            const savedNameRaw = getCookie('kiosk_stamp_name');
            const savedLocRaw = getCookie('kiosk_stamp_location');
            const savedName = savedNameRaw ? decodeURIComponent(savedNameRaw) : null;
            const savedLoc = savedLocRaw ? decodeURIComponent(savedLocRaw) : null;
            if (savedId && stampList.some(function (s) { return s.stampId === savedId; })) {
                selector.value = savedId;
                kiosk_stamp_id = savedId;
                const found = stampList.find(function (s) { return s.stampId === savedId; }) || {};
                kiosk_stamp_name = savedName || found.stampName || '';
                kiosk_stamp_location = savedLoc || found.stampLocation || '';
                updateScreenSaverStamp(kiosk_stamp_name, kiosk_stamp_location);
            } else {
                kiosk_stamp_id = '';
                kiosk_stamp_name = '';
                kiosk_stamp_location = '';
                updateScreenSaverStamp('', '');
            }
            
            // 변경 이벤트
            selector.addEventListener('change', function () {
                const selectedId = selector.value;
                const selected = stampList.find(function (s) { return s.stampId === selectedId; }) || {};
                kiosk_stamp_id = selectedId;
                kiosk_stamp_name = selected.stampName || '';
                kiosk_stamp_location = selected.stampLocation || '';
                setCookie('kiosk_stamp_id', kiosk_stamp_id, 365);
                setCookie('kiosk_stamp_name', kiosk_stamp_name, 365);
                setCookie('kiosk_stamp_location', kiosk_stamp_location, 365);
                updateScreenSaverStamp(kiosk_stamp_name, kiosk_stamp_location);
            });
        } catch (e) {
            console.error('스탬프 선택 초기화 중 오류:', e);
        }
    });
}

// 컨트롤 패널 표시/숨김 유틸리티
function showControlPanel() {
    const cp = eById('ControlPanel');
    if (cp) cp.style.display = 'block';
}
function hideControlPanel() {
    const cp = eById('ControlPanel');
    if (cp) cp.style.display = 'none';
}
function toggleControlPanel() {
    const cp = eById('ControlPanel');
    if (!cp) return;
    cp.style.display = (cp.style.display === 'none' || cp.style.display === '') ? 'block' : 'none';
}

// 메뉴 토글: 타이틀 더블클릭/더블탭
function setupTitleToggle() {
    const titleLabel = eById('titleLabel');
    if (!titleLabel) return;
    titleLabel.addEventListener('dblclick', function () {
        toggleControlPanel();
    });
    let lastTap = 0;
    titleLabel.addEventListener('touchend', function () {
        const now = Date.now();
        if (now - lastTap < 400) {
            toggleControlPanel();
        }
        lastTap = now;
    }, { passive: true });
}
setupScreenSaver();

setupScanner();
setupControlPanel();

setupStampInformation();
