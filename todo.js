let currentTab = 'all';
const todoItems = document.querySelector(".todoList_item");
const baseUrl = 'https://todolist-api.hexschool.io';

// 宣告非同步函式去拉 todo 資料
function getTodos(currentTab) {
    let url = '';
    switch (currentTab) {
        case 'pending':
            url = `${baseUrl}?completed=false`;
            break;
        case 'completed':
            url = `${baseUrl}?completed=true`;
            break;
        default:
            url = baseUrl;
    }
    return fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .catch(function(error) {
            console.error(error.message);
        });
};

// 渲染畫面
function renderData(currentTab) {
    todoItems.innerHTML = '<p>載入中...</p>'
    return getTodos(currentTab)
        .then(function(todos) {
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
            completedCount();
        })
        .catch(function(error) {
            todoItems.innerHTML = '<p>載入失敗，請再試試唷！</p>'
            console.error(error.message);
        });
}

renderData(currentTab)
