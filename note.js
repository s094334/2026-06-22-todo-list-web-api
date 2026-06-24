let currentTab = 'all';
const todoItems = document.querySelector(".todoList_item");
const baseUrl = 'https://todolist-api.hexschool.io';

// 渲染畫面
async function renderData() {
  todoItems.innerHTML = '<p>載入中...</p>'
  try {
    const response = await fetch(`${baseUrl}/todos/`,
      {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": token
        },
      }
    )

    if (!response.ok) {
      throw new Error(response.status);
    }

    const json = await response.json();
    const data = json.data;

    let template = '';
      data.forEach(function(item) {
        const { id, status, content } = item;
        template += `
          <li data-id="${id}">
            <label class="todoList_label">
              <input class="todoList_input" type="checkbox" value="true" ${status ? 'checked' : ''}>
              <span>${content}</span>
            </label>
            <a href="#">
              <i class="fa fa-times"></i>
            </a>
          </li>
        `
      });
      todoItems.innerHTML = template;
  } catch (error) {
    todoItems.innerHTML = '<p>載入失敗，請再試試唷！</p>'
    console.log(error.message)
  }
}

renderData()

// 新增 todo
const addBtn = document.querySelector(".addBtn");
const todoText = document.querySelector(".txt");

addBtn.addEventListener("click", function(e) {
  e.preventDefault();
  if (todoText.value.trim() === '') {
    alert("不能輸入空白值");
    return
  }
  addTodo(todoText.value)
  todoText.value = '';
})

todoText.addEventListener("keydown", function(e) {
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
        { 'Content-Type': 'application/json',
          'Authorization': token
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
    localStorage.setItem("id", data.newTodo.id);
    localStorage.setItem("createTime", data.newTodo.createTime);
    localStorage.setItem("content", data.newTodo.content);
    localStorage.setItem("status", data.newTodo.status);

    await renderData();
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

// 更新 todo 狀態
todoItems.addEventListener("click", function(e) {
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
        { 'Content-Type': 'application/json',
          'Authorization': token
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