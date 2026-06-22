const baseUrl = 'https://todolist-api.hexschool.io';

// 註冊帳號
const signUpEmail = document.querySelector('#sign-up-email');
const nickName = document.querySelector('#name');
const signUpPwd = document.querySelector('#sign-up-pwd');
const signUpPwdAgain = document.querySelector('#sign-up-pwd2');
const signUpBtn = document.querySelector('.sign-up-btn');

signUpBtn.addEventListener("click", function(e) {
  if (signUpEmail.value.trim() === '' || nickName.value.trim() === '' || signUpPwd.value.trim() === '' || signUpPwdAgain.value.trim() === '') {
    alert("不能輸入空白值");
    return
  }
  if (signUpPwd.value.trim().length <= 6) {
    alert("password 長度不足 6 個字");
    return
  }
  if (signUpPwd.value !== signUpPwdAgain.value) {
    alert("再次輸入的密碼不符");
    return
  }
  signUp(signUpEmail.value, signUpPwd.value, nickName.value);
})

async function signUp(signUpEmail, signUpPwd, nickName) {
  try {
    const response = await fetch(`${baseUrl}/users/sign_up`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "email": signUpEmail,
          "password": signUpPwd,
          "nickname": nickName
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem('uid', data.uid);
    alert('註冊成功，歡迎登入！');
    location.href = '#loginPage';
    return data;
  } catch (error) {
    console.error(error.message);
  }
}
