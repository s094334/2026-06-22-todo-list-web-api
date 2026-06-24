let currentTab = 'all';
const todoItems = document.querySelector('.todoList_item');
const baseUrl = 'https://todolist-api.hexschool.io';

// 取得目前 todo
async function getTodo() {
  todoItems.innerHTML = '<p>載入中...</p>'
  try {
    const response = await fetch(`${baseUrl}/todos/`,
      {
        method: 'GET',
        headers: 
          { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          },
      }
    )

    if (!response.ok) {
      throw new Error(response.status);
    }

    const json = await response.json();
    const data = json.data;
    return data;
  } catch (error) {
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
    filteredData.forEach(function(item) {
      const { id, status, content } = item;
      template += `
        <li data-id='${id}'>
          <label class='todoList_label'>
            <input class='todoList_input' type='checkbox' value='true' ${status ? 'checked' : ''}>
            <span class='todo_content'>${content}</span>
          </label>
          <button class='editBtn'>edit</button>
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
    const response = await fetch(`${baseUrl}/todos/`,
      {
        method: 'POST',
        headers: 
          { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          },
        body: JSON.stringify({
          content: content,
        })
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    await renderData();
    return data;
  } catch (error) {
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
    const response = await fetch(`${baseUrl}/todos/${id}/toggle`,
      {
        method: 'PATCH',
        headers: 
          { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    await renderData()
  } catch(error) {
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
    const response = await fetch(`${baseUrl}/todos/${id}`,
      {
        method: 'DELETE',
        headers: 
          { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    await renderData();
  } catch (error) {
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
    const response = await fetch(`${baseUrl}/todos/${id}`,
      {
        method: 'PUT',
        headers: 
          { 
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          },
        body: JSON.stringify({ 'content' : content })
      }
    )

    if (!response.ok) {
      throw new Error(`http ${response.status}`)
    }

    await renderData();
  } catch(error) {
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
function completedCount(data) {
  const completedCount = data.filter(item => item.status).length;
  const el = document.querySelector('.todoList_statistics p');
  el.textContent = `${completedCount} 個已完成項目`;
}