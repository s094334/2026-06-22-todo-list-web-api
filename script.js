// 註冊帳號
const signUpEmail = document.querySelector('#sign-up-email');
const nickName = document.querySelector('#name');
const signUpPwd = document.querySelector('#sign-up-pwd');
const signUpPwdAgain = document.querySelector('#sign-up-pwd2');
const signUpBtn = document.querySelector('.sign-up-btn');

signUpBtn.addEventListener("click", function(e) {
  const fields = [signUpEmail, nickName, signUpPwd, signUpPwdAgain];

  if (fields.some(field => field.value.trim() === '')) {
    alert('不能輸入空白值');
    return;
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
    const { data } = await axios.post(`${baseUrl}/users/sign_up`,
      {
        "email": signUpEmail,
        "password": signUpPwd,
        "nickname": nickName
      })
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
    return
  };

  if (signInPwd.value.trim() === '') {
    pwdError.textContent = '此欄位不可留空'
    return
  };

  signIn(signInEmail.value, signInPwd.value);
})

async function signIn(signInEmail, signInPwd) {
  try {
    const { data } = await axios.post(`${baseUrl}/users/sign_in`,
      {
        "email": signInEmail,
        "password": signInPwd
      });

    localStorage.setItem('nickname', data.nickname);
    localStorage.setItem('token', data.token);
    location.href = '#todoListPage';
    
    await renderData();
    return data;

  } catch (error) {
    const errorMessages = {
      400: '欄位驗證失敗',
      401: '帳號密碼驗證錯誤',
      404: '用戶不存在'
    };

    const status = error.response?.status;
    const message = errorMessages[status] || '發生未知錯誤';
    pwdError.textContent = message;
  }
}

// 登出帳號
const signOutBtn = document.querySelector('.sign-out-btn');

signOutBtn.addEventListener("click", function(e) {
  signOut();
})

async function signOut() {
  try {
    const { data } = await axios.post(`${baseUrl}/users/sign_out`,
      {},
      {
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": localStorage.getItem('token') 
        }
      });

    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    location.href = '#loginPage';

  } catch (error) {
    console.log(error.message)
  }
}

// 實作登入狀態驗證
document.addEventListener('DOMContentLoaded', async function() {
  if (location.hash === '#todoListPage') {
    await checkOut();
  }
});

async function checkOut() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('登入已過期，請重新登入');
    location.href = '#loginPage';
    return;
  }

  try {
    const { data } = await axios.get(`${baseUrl}/users/checkout`, 
      {
        headers: {
          'Authorization': token
        }
      }
    );

    const nickname =  localStorage.getItem('nickname')
    displayName.textContent = `${nickname} 的待辦`;

  } catch (error) {
    localStorage.removeItem('token');
    location.href = '#loginPage';
    console.log(error.message)
  }
}
