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
          "Authorization": localStorage.getItem('token') 
        },
      }
    )

    if (!response.ok) {
      throw new Error(response.status);
    }

    let template = '';
      todos.forEach(function(item) {
        const { id, completed, content } = item;
        template += `
        <li data-id="${id}">
          <label class="todoList_label">
            <input class="todoList_input" type="checkbox" value="true" ${completed ? 'checked' : ''}>
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
          "Authorization": localStorage.getItem('token')
        },
        body: JSON.stringify({
          content: content,
        })
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = response.json();
    localStorage.setItem("id", data.newTodo.id);
    localStorage.setItem("createTime", data.newTodo.createTime);
    localStorage.setItem("content", data.newTodo.content);
    localStorage.setItem("status", data.newTodo.status);
    return data;
  } catch (error) {
    console.log(error.message);
  }
}