document.addEventListener('DOMContentLoaded', () => {
  console.log('Page List chargée avec succès !');

  const todosContainer = document.querySelector('#todos')

  const modalModify = document.getElementById('modalModify');
  const modalTitleModify = document.getElementById('modal-title-modify');
  const todoTextInputModify = document.getElementById('todo-text-modify');
  const todoCheckedInputModify = document.getElementById('todo-checked-modify');
  const modalSaveModify = document.getElementById('modal-save-modify');
  const modalCancelModify = document.getElementById('modal-cancel-modify');

  const modalDelete = document.getElementById('modalDelete');
  const modalTitleDelete = document.getElementById('modal-title-delete');
  const todoTextInputDelete = document.getElementById('todo-text-delete');
  const todoCheckedInputDelete = document.getElementById('todo-checked-delete');
  const modalSaveDelete = document.getElementById('modal-save-delete');
  const modalCancelDelete = document.getElementById('modal-cancel-delete');

  const closeModalModify = document.querySelector('#close-modify');
  const closeModalDelete = document.querySelector('#close-delete');

  let currentTodoId = null;

  const openModifyModal = (todo) => {
    modalModify.style.display = 'block';
    modalTitleModify.textContent = 'Modify ToDo';
    currentTodoId = todo._id;
    todoTextInputModify.value = todo.text;
    todoCheckedInputModify.checked = todo.checked;
  };

  const openDeleteModal = (todo) => {
    modalDelete.style.display = 'block';
    modalTitleDelete.textContent = 'Delete ToDo';
    currentTodoId = todo._id;
    todoTextInputDelete.value = todo.text;
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

  closeModalModify.addEventListener('click', closeModalModifyAction);
  modalCancelModify.addEventListener('click', closeModalModifyAction);
  
  closeModalDelete.addEventListener('click', closeModalDeleteAction);
  modalCancelDelete.addEventListener('click', closeModalDeleteAction);

  modalSaveModify.addEventListener('click', async (e) => {
    e.preventDefault();

    const updatedTodo = {
      text: todoTextInputModify.value,
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
        alert('ToDo modifié avec succès !');
        location.reload();
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.message}`);
      }
    } catch (err) {
      alert('Erreur lors de la modification du ToDo.');
    }

    closeModalModifyAction();
  });

  modalSaveDelete.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/todos/${currentTodoId}`, { method: 'DELETE' });

      const result = await response.json();

      alert(result.message);
      location.reload();
     
    } catch (err) {
      alert('Erreur lors de la suppression du ToDo.');
    }

    closeModalDelete();
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
    console.log(todos.length);
    if (todos && todos.length > 0) {
      todos.forEach(todo => {
        const item = document.createElement('li');
        item.className = `items ${todo.checked ? 'checked' : ''}`;
        item.dataset.id = todo.id;
        item.textContent = todo.text;

        if (!todo.checked) {
          const span = document.createElement('span');
          const btnModify = appendChildWithContent('button', 'Modify', ['btn', 'modify']);
          const btnDeleted = appendChildWithContent('button', 'Delete', ['btn', 'deleted']);

          span.appendChild(btnModify);
          span.appendChild(btnDeleted);
          item.appendChild(span);

          btnModify.addEventListener('click', () => modifyTodo(todo));
          btnDeleted.addEventListener('click', () => deleteTodo(todo));
        }
        todosContainer.appendChild(item);
      })
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