let currentTab = 'all';
const todoItems = document.querySelector('.todoList_item');
const headers = {
  'Authorization': localStorage.getItem('token')
};
var baseUrl = 'https://todolist-api.hexschool.io';

// 取得目前 todo
async function getTodo() {
  todoItems.innerHTML = '<p>載入中...</p>'
  try {
    const { data } = await axios.get(`${baseUrl}/todos/`,
      { headers }
    )
    return data.data;
  } catch (error) {
    if (error.data?.status === 403) {
      alert('登入已過期，請重新登入');
      location.href = '#loginPage';
    }
    todoItems.innerHTML = '<p>載入失敗，請再試試唷！</p>'
    console.log(error.message)
  }
}

// 渲染畫面
async function renderData() {
  const data = await getTodo();
  if (!data) return;

  const filteredData = filteredTab(data);
  let template = '';
    filteredData.forEach(function(todo) {
      const { id, status, content } = todo;
      template += `
        <li data-id='${id}'>
          <label class='todoList_label'>
            <input class='todoList_input' type='checkbox' value='true' ${status ? 'checked' : ''}>
            <span class='todo_content'>${content}</span>
          </label>
          <button class='editBtn'>編輯</button>
          <a href='#'>
            <i class='fa fa-times'></i>
          </a>
        </li>
      `
    });
  todoItems.innerHTML = template;
  completedCount(data);
}

renderData()

// 新增 todo
const addBtn = document.querySelector('.addBtn');
const todoText = document.querySelector('.txt');

addBtn.addEventListener('click', function(e) {
  e.preventDefault();
  if (todoText.value.trim() === '') {
    alert('不能輸入空白值');
    return
  }
  addTodo(todoText.value)
  todoText.value = '';
})

todoText.addEventListener('keydown', function(e) {
  if (todoText.value === '' && e.key === ' ') {
    e.preventDefault();
  }
})

async function addTodo(content) {
  try {
    const { data } = await axios.post(`${baseUrl}/todos/`,
      { content },{ headers }
    );

    await renderData();
    return data.data;
  } catch (error) {
    if (error.status === 403) {
      alert('登入已過期，請重新登入');
      location.href = '#loginPage';
    };
    console.log(error.message);
  }
}

// 更新 todo 狀態
todoItems.addEventListener('change', function(e) {
  if (!e.target.classList.contains('todoList_input')) return;
  const list = e.target.closest('li');
  const todoId = list.dataset.id;

  toggleStatus(todoId);
})

async function toggleStatus(id) {
  try {
    const { data } = await axios.patch(`${baseUrl}/todos/${id}/toggle`,
      {}, { headers }
    );

    await renderData()
  } catch(error) {
    if (error.status === 403) {
      alert('登入已過期，請重新登入');
      location.href = '#loginPage';
    };
    console.log(error.message);
  }
}

// 刪除 todo
todoItems.addEventListener('click', function(e) {
    if (!e.target.closest('a')) return;
    e.preventDefault();

    const list = e.target.closest('li');
    const todoId = list.dataset.id;
    
    deleteTodo(todoId);
})

async function deleteTodo(id) {
  try {
    const { data } = await axios.delete(`${baseUrl}/todos/${id}`,
      { headers }
    );

    await renderData();
  } catch (error) {
    if (error.status === 403) {
      alert('登入已過期，請重新登入');
      location.href = '#loginPage';
    };
    console.log(error.message)
  }
}

// 修改 todo 內容
todoItems.addEventListener('click', function(e) {
  if (!e.target.classList.contains('editBtn')) return;

  const list = e.target.closest('li');
  const todoId = list.dataset.id;

  const span = list.querySelector('.todo_content');
  const originText = span.textContent;

  const input = document.createElement('input');
  input.value = originText;
  span.replaceWith(input);
  input.focus();

  async function submitEdit() {
    const newContent = input.value.trim();
    if (newContent && newContent !== originText) {
      await editTodo(todoId, newContent);
    } else {
      await renderData();
    }
  }

  input.addEventListener('blur', submitEdit);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Escape') renderData();
  });
})

async function editTodo(id, content) {
  try {
    const { data } = await axios.put(`${baseUrl}/todos/${id}`,
      { content }, { headers }
    );

    await renderData();
  } catch(error) {
    if (error.status === 403) {
      alert('登入已過期，請重新登入');
      location.href = '#loginPage';
    };
    console.log(error.message)
  }
}

// 顯示全部、待完成還是已完成
const todoListTab = document.querySelector('.todoList_tab');

todoListTab.addEventListener('click', function(e) {
  e.preventDefault();

  const allTabs = todoListTab.querySelectorAll('a');
  allTabs.forEach(function(tab) {
    tab.classList.remove('active');
  })

  const tab = e.target.closest('a');
  tab.classList.add('active');

  const filter = tab.dataset.tab;
  currentTab = filter;
  renderData();
})

// 篩選不同的 todo
function filteredTab(data) {
  switch (currentTab) {
    case 'pending':
      return data.filter(({ status }) => !status);
    case 'completed':
      return data.filter(({ status }) => status);
    default:
      return data;
  }
}

// 計算已完成的項目
function completedCount(todos) {
  const completedCount = todos.filter(item => item.status).length;
  const el = document.querySelector('.todoList_statistics p');
  el.textContent = `${completedCount} 個已完成項目`;
}

// 清除已完成項目
const delcompletedBtn = document.querySelector(".todoList_statistics a");
delcompletedBtn.addEventListener("click", async function(e) {
  e.preventDefault();
  const data = await getTodo();
  if (!data) return;

  const completedData = data.filter(todo => todo.status);
  await Promise.all(completedData.map(todo => deleteTodo(todo.id)));
  alert('清除已完成項目')
  await renderData();
})