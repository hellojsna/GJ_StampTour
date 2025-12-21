//
//  index.js
//  GJ_StampTour
//
//  Created by Js Na on 2023/12/12.
//  Copyright © 2023 Js Na, All rights reserved.
//

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
function deleteCookie(name) {
    document.cookie = encodeURIComponent(name) + '=;expires=Thu, 01 JAN 1999 00:00:10 GMT;';
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

function enableCookieUpdate() {
    setInterval(function () {
        let stampCookie = getCookie("LocalStamp");
        if (stampCookie != null) {
            let stampJSON = decodeURIComponent(stampCookie);
            let stampList = JSON.parse(stampJSON);
            for (let i = 0; i < stampList.length; i++) {
                let stampData = stampList[i];
                let stampElement = eById(stampData);
                if (stampElement != null) {
                    stampElement.classList.add("checked");
                }
            }
        }
    }, 1000);
}
/* 주요 변수 선언 */
let CurrentFloor = 1;
let guidePage = 0;
let uA = window.navigator.userAgent.toLowerCase();

/* Element Outlet */
let classroomList = eByCl("classroom");
let notClassroomList = eByCl("notClassroom");
let StampView = eById("StampView");
let stampListView = eById("stampList");
let GuideModalContainer = eById("GuideModalContainer");
let ClassInfoModalContainer = eById("ClassInfoModalContainer");
let ClassInfoModalTitle = eById("ClassInfoModalTitle");
let CMSN = eById("CMStampName");
let CMSD = eById("CMStampDesc");
let CMST = eById("CMStampType");
let CMSS = eById("CMStampStatus");
let VideoPlayer = eById("GuideVideo");
let GuideHint = eById("GuideHint");
let GuideText = eById("GuideText");
let NextGuideButton = eById("NextGuideButton");

let StudentIdInput = eById("StudentIdInput");
let StudentNameInput = eById("StudentNameInput");
let StudentPasswordInput = eById("StudentPasswordInput");


function getStampList() {
    getJSON(`/api/stampList24.json`, function (err, data) {
        if (err != null) {
            alert("스탬프 목록 데이터를 불러오는 중 오류가 발생했습니다.");
        } else if (data !== null) {
            let sL = data.stampList;
            for (let i = 0; i < sL.length; i++) {
                let sD = sL[i];
                if (!sD.stampId.startsWith("000000000-0000-0000-0000-")) {
                    let stampElement = document.createElement("div");
                    stampElement.classList.add("stamp");
                    stampElement.id = sD.stampId;
                    stampElement.innerHTML = `<img src="/images/circle.svg"><img class="CheckMark" src="/images/check.svg"><span><h2>${sD.stampName}</h2><p>${filterClassroomName(sD.stampLocation)}</p></span>`;
                    eById("stampList").appendChild(stampElement);
                }
            }
        }
    });
}

function enableMapZoom(mapElement) {
    if ('ontouchstart' in window || navigator.msMaxTouchPoints) {
        zoom = panzoom(mapElement, {
            bounds: true,
            boundsPadding: 0,
            maxZoom: 2,
            minZoom: 0.3,
            zoomDoubleClickSpeed: 1,
            onTouch: (e) => {
                const t = e.target;
                let ttn = t.tagName;
                let ttc = t.classList[0];
                if ((ttc != "hallway" && ttc != "notClassroom") && (ttn === "g" || ttn === "rect" || ttn === "text")) {
                    return false;
                } else {
                    e.preventDefault();
                }
            }
        });
    } else {
        zoom = panzoom(mapElement, {
            bounds: true,
            boundsPadding: -0.5,
            maxZoom: 5,
            minZoom: 0.5,
            zoomDoubleClickSpeed: 1,
            contain: 'outside'
        });
    }
}
function floorChange(f) {
    let CurrentFloorMap = eById(`Floor${CurrentFloor}MapView`);
    let NewFloorMap = eById(`Floor${f}MapView`);
    eById(`Floor${CurrentFloor}`).classList.remove("selected");
    eById(`Floor${f}`).classList.add("selected");
    CurrentFloorMap.classList.remove("active");
    NewFloorMap.classList.add("active");
    CurrentFloor = f;
}
function setStampView() {
    let StampView = eById("StampView");
    eById("StampView").addEventListener("click", function () {
        eById("StampView").classList.toggle("open");
    });
    eById("ShowGuideButton").addEventListener("click", function () {
        eById("GuideModalContainer").style.display = "flex";
        showNextGuide();
    });
}

const userAgent = navigator.userAgent.toLowerCase();
const isTablet = (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent) || (userAgent.includes("mac") && navigator.maxTouchPoints > 4 && !userAgent.includes("iphone")));

function validateRegisterInputs() {
    if (StudentIdInput.value.length == 5 && StudentNameInput.value.length >= 2 && StudentPasswordInput.value.length == 4 && eById("PrivacyPolicyCheckbox").checked) {
        NextGuideButton.disabled = false;
    } else {
        NextGuideButton.disabled = true;
    }
}
function showNextGuide() {
    NextGuideButton.disabled = true;
    VideoPlayer.play();
    VideoPlayer.pause();
    VideoPlayer.style.opacity = 1;

    switch (guidePage) {
        case 0:
            VideoPlayer.currentTime = 0;
            GuideText.innerText = `지도 오른쪽 아래에 있는 방문 인증 버튼을 눌러주세요.`;
            setTimeout(() => {
                VideoPlayer.play();
                setTimeout(() => {
                    VideoPlayer.pause();
                    NextGuideButton.disabled = false;
                }, 840);
                guidePage += 1;
            }, 500);
            break;
            case 1:
                VideoPlayer.play();
                GuideText.innerText = `부스에 있는 태블릿에 QR코드를 스캔해 주세요.`;
                setTimeout(() => {
                    VideoPlayer.pause();
                    NextGuideButton.innerText = "시작하기";
                    NextGuideButton.disabled = false;
                    eById("ReplayButtonContainer").style.display = "block";
                }, 3800);
                guidePage += 1;
                break;
        case 2:
            NextGuideButton.disabled = true;
            NextGuideButton.innerText = "시작하기";
            GuideText.style.display = "none";
            VideoPlayer.style.display = "none";
            eById("ReplayButtonContainer").style.display = "none";
            eById("PrivacyPolicyCheckboxContainer").style.display = "flex";

            eById("GuideTitle").innerText = "시작 전 본인의 정보를 알려주세요";
            GuideHint.innerText = "타인의 정보를 도용할 경우 불이익이 있을 수 있습니다.";
            GuideHint.style.color = "var(--red)";

            StudentIdInput.addEventListener("input", () => {
                StudentIdInput.value = StudentIdInput.value.replace(/[^0-9]/g, '');
                validateRegisterInputs();
            });
            StudentNameInput.addEventListener("input", () => {
                validateRegisterInputs();
            });
            StudentPasswordInput.addEventListener("input", () => {
                StudentPasswordInput.value = StudentPasswordInput.value.replace(/[^0-9]/g, '');
                validateRegisterInputs();
            });
            eById("PrivacyPolicyCheckbox").addEventListener("change", () => {
                validateRegisterInputs();
            });
            StudentIdInput.style.display = "block";
            StudentNameInput.style.display = "block";
            StudentPasswordInput.style.display = "block";
            setTimeout(() => {
                StudentIdInput.classList.add("show");
                StudentNameInput.classList.add("show");
                StudentPasswordInput.classList.add("show");
            }, 100);
            guidePage += 1;
            break;
        case 3:
            var xhr = new XMLHttpRequest();
            xhr.open('POST', "/login", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.responseType = 'json';
            xhr.onload = function () {
                var status = xhr.status;
                if (status === 200) {
                    alert(`${xhr.response.user_name}(${xhr.response.user_id})님, 환영합니다.)`);
                    setCookie("user_id", xhr.response.user_id, 7);
                    setCookie("user_name", StudentIdInput.value + StudentNameInput.value, 7);
                    setCookie("ShowGuide", "true", 1);
                    guidePage = 0;
                    GuideModalContainer.style.display = "none";
                } else {
                    alert(`서버와 통신을 실패했습니다. 다시 시도해 주세요.`);
                    NextGuideButton.disabled = false;
                }
            };
            xhr.send(`{ "user": "${StudentIdInput.value}${StudentNameInput.value}", "password": "${StudentPasswordInput.value}" }`); // 보낼 데이터 지정
            // 내가 여기 왜 xhr을 썼지???
            // GET이 아니라 POST라서 getJSON 안 쓴 듯?
            break;
        default:
            break;
    }
}
function loadGuideVideo(deviceType) {
    // FIXME: NFC 관련 내용 변경
    let darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? "_Dark" : "";
    let source1 = document.createElement("source");
    source1.src = `/videos/Guide_NFC_${deviceType}${darkMode}.webm`;
    source1.type = "video/webm";
    let source2 = document.createElement("source");
    source2.src = `/videos/Guide_NFC_${deviceType}${darkMode}.webm`;
    source2.type = "video/mp4";

    VideoPlayer.appendChild(source1);
    VideoPlayer.appendChild(source2);
}
function checkDirection() {
    if (touchendY < touchstartY) {
        if (!StampView.classList.contains("open")) {
            StampView.classList.toggle("open");
        }
    } else if (touchendY > touchstartY) {
        if (StampView.classList.contains("open")) {
            StampView.classList.toggle("open");
        }
    }
};

for (let i = 1; i <= 4; i++) { // Loop from 1 to 4 (number of floors)
    enableMapZoom(eById(`Floor${i}MapView`));
}
for (let i = 1; i <= 4; i++) {
    eById(`Floor${i}`).addEventListener("click", () => floorChange(i));
}
if (window.location.hash.startsWith("#Floor")) {
    floorChange(window.location.hash.replace("#Floor", ""));
}

function filterClassroomName(name) {
    return (name.startsWith("교실") ? `${name.slice(0, 3)}학년 ${name.slice(3)}반`.replace("교실", "").replace(" 0", " ") : name);
}
getJSON(`/api/stampList24.json`, function (err, data) {
    if (err != null) {
        alert("스탬프 목록을 불러오는 중 오류가 발생했습니다.");
    } else if (data !== null) {
        let sL = data.stampList;
        for (let i = 0; i < sL.length; i++) {
            let sD = sL[i];
            let sDsL = sD.stampLocation.split(",");
            if (sDsL.length > 1) {
                for (let j = 0; j < sDsL.length; j++) {
                    eById(sDsL[j]).addEventListener("click", () => {
                        ClassInfoModalContainer.style.display = "flex";
                        ClassInfoModalTitle.innerText = `${sDsL[j]}(${(sDsL[j - 1]) ? sDsL[j - 1] : sDsL[j + 1]})`;
                        CMSN.innerText = sD.stampName;
                        CMSD.innerText = sD.stampDesc;
                    });
                }
            } else {
                console.log(sD.stampLocation);
                eById(sD.stampLocation).addEventListener("click", () => {
                    ClassInfoModalContainer.style.display = "flex";
                    ClassInfoModalTitle.innerText = filterClassroomName(sD.stampLocation);
                    CMSN.innerText = sD.stampName;
                    // stampDesc starts with [value], so check that and move to CMStampType
                    CMST.removeAttribute('class');
                    CMST.innerText = sD.stampDesc.slice(1, sD.stampDesc.indexOf("]"));
                    switch (CMST.innerText) {
                        case "공연":
                            CMST.classList.add("gongyeon");
                            break;
                        case "전시":
                            CMST.classList.add("jeonsi");
                            break;
                        case "전시 및 체험":
                            CMST.classList.add("jeonsicheheom");
                            break;
                        case "체험":
                            CMST.classList.add("cheheom");
                            break;
                        default:
                            break;
                    }
                    CMSD.innerText = sD.stampDesc.slice(sD.stampDesc.indexOf("]") + 2);
                    stampCheck = getCookie("LocalStamp");
                    if (!sD.stampId.startsWith("000000000-0000-0000-0000-") && stampCheck != null) {
                        let stampList = JSON.parse(decodeURIComponent(stampCheck));
                        if (stampList.includes(sD.stampId)) {
                            CMSS.innerText = "방문한 부스";
                            CMSS.classList.add("checked");
                        } else {
                            CMSS.innerText = "방문하지 않은 부스";
                            CMSS.classList.remove("checked");
                        }
                    } else {
                        CMSS.innerText = "-";
                        CMSS.classList.remove("checked");
                    }
                });
            }
        }
    }
});
for (let i = 0; i < notClassroomList.length; i++) {
    notClassroomList[i].addEventListener("click", () => {
        //alert(`${notClassroomList[i].id} 부스 정보가 없습니다.`);
    });
}

StampView.addEventListener('touchstart', e => {
    const t = e.target;
    let ttn = t.tagName;
    let ttc = t.classList[0];
    if ((stampListView.scrollTop <= 0) || (t != stampListView && ttc != "stamp" && ttn != "span" && ttn != "img" && ttn != "h2" && ttn != "p")) {
        touchstartY = e.changedTouches[0].screenY;
    } else {
        touchstartY = 0;
    }
});
let touchstartY = 0;
let touchendY = 0;

StampView.addEventListener('touchend', e => {
    const t = e.target;
    let ttn = t.tagName;
    let ttc = t.classList[0];
    if ((stampListView.scrollTop <= 0) || (t != stampListView && ttc != "stamp" && ttn != "span" && ttn != "img" && ttn != "h2" && ttn != "p")) {
        touchendY = e.changedTouches[0].screenY;
        checkDirection();
    }
});
eById("ClassInfoModalCloseButton").addEventListener("click", () => {
    ClassInfoModalContainer.style.display = "none";
});
NextGuideButton.addEventListener("click", showNextGuide);

eById("ReplayGuideButton").addEventListener("click", () => {
    guidePage = 0;
    showNextGuide();
});

window.onload = function () {
    VideoPlayer.pause();
    setStampView();
    getStampList();
    enableCookieUpdate();
    if (getCookie("ShowGuide") == null) {
        GuideModalContainer.style.display = "flex";
        showNextGuide();
    }
}
/*
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
window.Tawk_API.onLoad = function () {
    setTimeout(() => {
        let iframes = document.getElementsByTagName("iframe");
        let st = document.createElement("style");
        st.innerHTML = `.tawk-chatinput-send{color:#4e7cf1 !important} ::selection{background:#4e7cf1 !important} .tawk-flex.tawk-flex-center.tawk-text-center.tawk-padding-small, .tawk-branding{padding:0 !important;transform:scale(0.9)} .tawk-icon.tawk-icon-attach-file{color:#4e7cf1} .file-upload-progress .progress-bar{background:#4e7cf1 !important} .tawk-header-text.tawk-margin-auto-left.tawk-flex-none.tawk-button-hover.tawk-button.tawk-button-text.tawk-button-color-inverse.tawk-tooltip{display:none}`
        for (let i = 0; i < iframes.length; i++) {
            if (iframes[i].style.height == "100%") {
                iframes[i].contentDocument.head.appendChild(st);
            }
        }
        document.getElementById("HelpButton").addEventListener("click", () => {
            Tawk_API.maximize();
        });
    }, 1000);
};*/