//
//  pass.js
//  GJ_StampTour
//
//  Created by Js Na on 2025/12/21.
//  Copyright © 2025 Js Na. All rights reserved.
//

const isDebugMode = true; // PROD에서 false로 설정 요망
var secret = getCookie("user_id"); // UID를 TOTP 시크릿으로 사용
if (isDebugMode && !secret) {
    alert("PROD에서 제거 요망: 쿠키에 user_id 없음. 디버깅용 시크릿 사용.");
    secret = "591DC6BFBFF6466F952E07655A53C78D";
}
async function generateToken() {
    token = await TOTP.otp(secret, 6);
    eById("OTPText").innerText = token;
    eById("QRCode").innerHTML = "";
    new QRCode(eById("QRCode"), {
        text: token + secret, // OTP + UID로 QR코드 생성. OTP는 저장만 하고 부정행위 의심 시 비교용으로 사용.
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}
generateToken();
setInterval(async function () {
    const untilNextGen = TOTP.getCountdown();
    eById("OTPTime").innerText = `${untilNextGen}초`;
    if (isDebugMode) console.log(`다음 토큰 생성까지 ${untilNextGen}초 남음.`);
    if (untilNextGen == 30) {
        if (isDebugMode) console.log("새 토큰 생성");
        await generateToken();
    }
}, 1000);