//
//  pass.js
//  GJ_StampTour
//
//  Created by Js Na on 2025/12/21.
//  Copyright © 2025 Js Na. All rights reserved.
//

const isDebugMode = true; // PROD에서 false로 설정 요망
var user_id = getCookie("user_id");
var user_name = getCookie("user_name");
var last_token = "";
var timeUntilNextCode = 30;

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

if (isDebugMode && (!user_id || !user_name)) {
    alert("PROD에서 제거 요망: 쿠키에 user_id 또는 user_name 없음.");
    if (!user_id) user_id = "591DC6BFBFF6466F952E07655A53C78D";
    if (!user_name) user_name = "12345홍길동";
}

async function generateToken() {
    getJSON(`/otp/generate`, function (err, data) {
        if (err != null) {
            alert("인증 코드를 불러오는 중 오류가 발생했습니다.");
        } else if (data !== null) {
            /*if (last_token == data.last_otp) {
                // TODO: 백엔드 완성 후 구현
                // 마지막으로 생성했던 토큰이 인증 처리됨 -> 스탬프 처리 완료
                // data.last_stamp_id 저장
            }*/
            const token = data.otp;
            last_token = token;
            eById("OTPText").innerText = `${token.slice(0, 3)} ${token.slice(3, 6)}`;
            eById("QRCode").innerHTML = "";

            new QRCode(eById("QRCode"), {
                text: token, // 서버에서 생성한 토큰으로 QR코드 생성
                colorDark: "#000000",
                colorLight: "#ffffff00",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    });
}
generateToken();
setInterval(async function () {
    // 현재 시각: hh:mm:ss 형식
    eById("CurrentTimeDisplay").innerText = `현재 시각: ${new Date().toTimeString().slice(0, 8)}`;
    timeUntilNextCode -= 1;
    eById("OTPTime").innerText = `${timeUntilNextCode}초 후 새로고침`;
    if (isDebugMode) console.log(`다음 토큰 생성까지 ${timeUntilNextCode}초 남음.`);
    if (timeUntilNextCode == 0) {
        if (isDebugMode) console.log("새 토큰 생성");
        await generateToken();
        timeUntilNextCode = 30;
    }
}, 1000);

eById("CurrentTimeDisplay").innerText = `현재 시각: ${new Date().toTimeString().slice(0, 8)}`;
eById("CurrentUserDisplay").innerText = `${user_name}`;