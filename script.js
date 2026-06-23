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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(signUpEmail.value)) {
    alert("請輸入正確的 email 格式");
    return;
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
      const message = response.status === 400 ? '此 email 已被註冊' : '發生未知錯誤';
      alert(message);
      return;
    }

    const data = await response.json();
    localStorage.setItem('uid', data.uid);
    localStorage.setItem('nickname', nickName);
    alert('註冊成功，歡迎登入！');
    location.href = '#loginPage';
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

// 登入帳號
const signInEmail = document.querySelector('#sign-in-email');
const signInPwd = document.querySelector('#sign-in-pwd');
const signInBtn = document.querySelector('.sign-in-btn');
const emailError = document.querySelector('#email-error');
const pwdError = document.querySelector('#pwd-error');
const displayName = document.querySelector('.todo_sm');

signInBtn.addEventListener("click", function(e) {
  emailError.textContent = '';
  pwdError.textContent = '';
  
  if (signInEmail.value.trim() === '') {
    emailError.textContent = '此欄位不可留空'
  };

  signIn(signInEmail.value, signInPwd.value);
  displayName.textContent = localStorage.getItem('nickname');
})

async function signIn(signInEmail, signInPwd) {
  try {
    const response = await fetch(`${baseUrl}/users/sign_in`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "email": signInEmail,
          "password": signInPwd
        })
      }
    );
    const data = await response.json();

    if (!response.ok) {
      const errorMessages = {
        400: '欄位驗證失敗',
        401: '帳號密碼驗證錯誤',
        404: '用戶不存在'
      };

      const message = errorMessages[response.status] || '發生未知錯誤';
      throw new Error(message);
    }

    localStorage.setItem('token', data.token);
    location.href = '#todoListPage';
    return data;

  } catch (error) {
    pwdError.textContent = error.message;
  }
}

// 登出帳號
const signOutBtn = document.querySelector('.sign-out-btn');

signOutBtn.addEventListener("click", function(e) {
  signOut();
})

async function signOut() {
  try {
    const response = await fetch(`${baseUrl}/users/sign_out`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": localStorage.getItem('token') 
        },
      });
    
    if(!response.ok) {
      throw new Error(response.status);
    }

    const data = await response.json();
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    localStorage.removeItem('nickname');
    location.href = '#loginPage';

  } catch (error) {
    console.log(error.message)
  }
}