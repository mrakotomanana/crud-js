document.addEventListener('DOMContentLoaded', () => {
  console.log('Page List chargée avec succès !');

  const todosContainer = document.querySelector('#todos')

  const modalModify = document.getElementById('modalModify');
  const modalTitleModify = document.getElementById('modal-title-modify');
  const todoTextInputModify = document.getElementById('todo-text-modify');
  const todoTextUsernameModify = document.getElementById('todo-text-username-modify');
  const todoDateModify = document.getElementById('todo-text-date-modify');
  const todoCheckedInputModify = document.getElementById('todo-checked-modify');
  const modalSaveModify = document.getElementById('modal-save-modify');
  const modalCancelModify = document.getElementById('modal-cancel-modify');

  const modalDelete = document.getElementById('modalDelete');
  const modalTitleDelete = document.getElementById('modal-title-delete');
  const todoTextInputDelete = document.getElementById('todo-text-delete');
  const todoTextUsernameDelete = document.getElementById('todo-text-username-delete');
  const todoCheckedInputDelete = document.getElementById('todo-checked-delete');
  const modalSaveDelete = document.getElementById('modal-save-delete');
  const modalCancelDelete = document.getElementById('modal-cancel-delete');
  const closeModalDelete = document.querySelector('#close-delete');

  const pagination = document.querySelector('#pagination');


  let currentTodoId = null;

  const openModifyModal = (todo) => {
    modalModify.style.display = 'block';
    currentTodoId = todo._id;
    todoTextInputModify.value = todo.text;
    todoTextUsernameModify.value = todo.username;
    todoDateModify.value = todo.dueDate == undefined ? new Date().toISOString().split('T')[0] : new Date(todo.dueDate).toLocaleDateString();
    todoCheckedInputModify.checked = todo.checked;
  };

  const openDeleteModal = (todo) => {
    modalDelete.style.display = 'block';
    modalTitleDelete.textContent = 'Supprimer une tâche';
    currentTodoId = todo._id;
    todoTextInputDelete.value = todo.text;
    todoTextUsernameDelete.value = todo.username;
    todoCheckedInputDelete.checked = todo.checked;
  };

  const closeModalModifyAction = () => {
    modalModify.style.display = 'none';
    currentTodoId = null;
  };

  const closeModalDeleteAction = () => {
    modalDelete.style.display = 'none';
    currentTodoId = null;
  };

  modalCancelModify.addEventListener('click', closeModalModifyAction);
  
  closeModalDelete.addEventListener('click', closeModalDeleteAction);
  modalCancelDelete.addEventListener('click', closeModalDeleteAction);

  modalSaveModify.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log(todoTextInputModify.value)
    console.log(todoCheckedInputModify.value)
    console.log(todoDateModify.value)
    const updatedTodo = {
      text: todoTextInputModify.value,
      dueDate: todoDateModify.value,
      checked: todoCheckedInputModify.checked,
    };

    try {
      const response = await fetch(`/api/todos/${currentTodoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodo),
      });

      if (response.ok) {
        alert('Tâche modifié avec succès !');
        location.reload();
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.message}`);
      }
    } catch (err) {
      alert('Erreur lors de la modification de la tâche. ' + err.message);
    }

    closeModalModifyAction();
  });

  modalSaveDelete.addEventListener('click', async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/todos/${currentTodoId}`, { method: 'DELETE' });
      if (response.ok) {
        alert("Tâche bien supprimée.");        
        closeModalDeleteAction();
        location.reload();
      }else{
        alert('Erreur lors de la suppression de la tâche.');
        closeModalDeleteAction();
      }
    } catch (err) {
      alert(`Erreur : ${err.message}`);
      closeModalDeleteAction();
    }
  });

  window.addEventListener('click', (event) => {
    if (event.target === modalModify) {
      closeModalModifyAction();
    }
    if (event.target === modalDelete) {
      closeModalDeleteAction();
    }
  });

  const loadTodos = async function (todos) {
    todosContainer.innerHTML = '';
    console.log(currentPage)
    console.log(totalPages)
    if (todos && todos.length) {
      todos.forEach(todo => {
        const item = document.createElement('li');
        item.className = `items ${todo.checked ? 'checked' : ''}`;
        item.dataset.id = todo.id;
        let dateFin = "Date de fin : " + todo.dueDate == undefined ? 'Non définie' : new Date(todo.dueDate).toLocaleDateString();
        item.textContent = todo.text + " | " + todo.username + " | " + dateFin;

        const span = document.createElement('span');
        if (!todo.checked) {
          const btnModify = appendChildWithContent('button', 'Modifier', ['btn', 'modify']);
          btnModify.addEventListener('click', () => modifyTodo(todo));
          span.appendChild(btnModify);          
        }
        const btnDeleted = appendChildWithContent('button', 'Supprimer', ['btn', 'deleted']);
        btnDeleted.addEventListener('click', () => deleteTodo(todo));
        span.appendChild(btnDeleted);
        item.appendChild(span);
        todosContainer.appendChild(item);
       
      })

      if (currentPage> 1) {
        let i = currentPage - 1;
        const li = document.createElement('li');
        li.className = `page-item`;
        li.innerHTML = `<a class="page-link" href="/list?page=${i}">Precedent</a>`;
        pagination.appendChild(li);
     }
    var pageView = currentPage + 2;
    if(pageView > totalPages){
      pageView = totalPages
    }
    for (let i = currentPage; i <= pageView; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="/list?page=${i}">${i}</a>`;
      pagination.appendChild(li);
    }
    if (currentPage < totalPages) {
      let i = currentPage + 1;
      const li = document.createElement('li');
      li.className = `page-item`;
      li.innerHTML = `<a class="page-link" href="/list?page=${i}">Suivant</a>`;
      pagination.appendChild(li);
   } 
    } else {
      const item = document.createElement('li');
      item.className = `items no-data`;
      item.innerHTML = `Aucune donnée trouvée. <button><a href='/add'>Ajouter tâche</a></button>`;
      todosContainer.appendChild(item);
    }
    
  }

  const modifyTodo = function (todo) {
    if (confirm('Voulez-vous vraiment modifier cette tâche ?')) {
      openModifyModal(todo);
    }
  }

  const deleteTodo = function (todo) {
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      openDeleteModal(todo);
    }
  }

  loadTodos(todos);

});


const appendChildWithContent = (elementToAppend, textContent, listClass = []) => {
  let element = document.createElement(elementToAppend);
  element.textContent = textContent;
  if (listClass.length > 0) {
    listClass.forEach((item) => {
      element.classList.add(item);
    });
  }
  return element;
}