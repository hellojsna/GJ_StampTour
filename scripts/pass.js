//
//  pass.js
//  GJ_StampTour
//
//  Created by Js Na on 2025/12/21.
//  Copyright © 2025 Js Na. All rights reserved.
//

var user_id = getCookie("user_id");
var user_name = decodeURIComponent(getCookie("user_name"));
var student_id = user_name.replace(/[^0-9]/g, "").slice(-5);
var last_token_list = [];

var timeUntilNextCode = 7;
var codeGenerationCount = 0;

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
async function generateToken() {
    if (codeGenerationCount > 10) {
        alert("인증 시간 초과. 메인 화면으로 돌아갑니다.");
        setTimeout(() => {
            if (getCookie("ShowGuide") != null) {
                window.opener = null; window.open('', '_self'); window.close(); window.history.go(-1); $(document.body).hide();
            }
            window.location.href = "/";
        }, 100);
    } else {
        getJSON(`/otp/generate`, function (err, data) {
            if (err != null) {
                alert("인증 코드를 불러오는 중 오류가 발생했습니다.");
            } else if (data !== null) {
                if (data.last !== null) {
                    if (last_token_list.includes(data.last.otp)) {
                        // TODO: 백엔드 완성 후 구현
                        // 마지막으로 생성했던 토큰이 인증 처리됨 -> 스탬프 처리 완료
                        // data.last_stamp_id 저장
                        window.location.href = `/check_local?stampId=${data.last.stamp_id}`;
                        if (data.last.stamp_id == programmingCafeId) {

                        } else {
                        }
                    }
                }
                const token = data.otp;
                last_token_list.push(token);
                eById("OTPText").innerText = `${token.slice(0, 3)} ${token.slice(3, 6)}`;
                eById("QRCode").innerHTML = "";

                new QRCode(eById("QRCode"), {
                    text: token, // 서버에서 생성한 토큰으로 QR코드 생성
                    colorDark: "#000000",
                    colorLight: "#ffffff00",
                    correctLevel: QRCode.CorrectLevel.H
                });
                codeGenerationCount += 1;
            }
        });
    }
}
generateToken();
setInterval(async function () {
    eById("CurrentTimeDisplay").innerText = `현재 시각: ${new Date().toTimeString().slice(0, 8)}`;
    timeUntilNextCode -= 1;
    eById("OTPTime").innerText = `${timeUntilNextCode}초 후 새로고침`;
    if (timeUntilNextCode == 0) {
        await generateToken();
        timeUntilNextCode = 7;
    }
}, 1000);

eById("CurrentTimeDisplay").innerText = `현재 시각: ${new Date().toTimeString().slice(0, 8)}`;
eById("CurrentUserDisplay").innerText = `${user_name}`;