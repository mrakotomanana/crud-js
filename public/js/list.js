document.addEventListener('DOMContentLoaded', () => {
  console.log('Page List chargée avec succès !');

  const todosContainer = document.querySelector('#todos')

  const modalModify = document.getElementById('modalModify');
  const modalTitleModify = document.getElementById('modal-title-modify');
  const todoTextInput = document.getElementById('todo-tex-modify');
  const todoCheckedInput = document.getElementById('todo-checked');
  const modalSaveModify = document.getElementById('modal-save-modify');
  const modalCancel = document.getElementById('modal-cancel');
  const closeModal = document.querySelector('.close');

  let currentTodoId = null;

  const openModifyModal = (todo) => {
    modalModify.style.display = 'block';
    modalTitleModify.textContent = 'Modify ToDo';
    currentTodoId = todo._id;
    todoTextInput.value = todo.text;
    todoCheckedInput.checked = todo.checked;
  };

  // Fermer la modale
  const closeModalAction = () => {
    modalModify.style.display = 'none';
    currentTodoId = null; // Réinitialiser l'ID
  };

  closeModal.addEventListener('click', closeModalAction);
  modalCancel.addEventListener('click', closeModalAction);

  modalSaveModify.addEventListener('click', async (e) => {
    e.preventDefault();

    const updatedTodo = {
      text: todoTextInput.value,
      checked: todoCheckedInput.checked,
    };

    try {
      // Appel API pour modifier le ToDo
      const response = await fetch(`/api/todos/${currentTodoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodo),
      });

      if (response.ok) {
        alert('ToDo modifié avec succès !');
        location.reload(); // Recharger la page
      } else {
        const error = await response.json();
        alert(`Erreur : ${error.message}`);
      }
    } catch (err) {
      alert('Erreur lors de la modification du ToDo.');
    }

    closeModalAction();
  });

  window.addEventListener('click', (event) => {
    if (event.target === modalModify) {
      closeModalAction();
    }
  });

  const loadTodos = async function (todos) {
    todosContainer.innerHTML = ''
    if (todos) {
      todos.forEach(todo => {
        const item = document.createElement('li')
        item.className = `items ${todo.checked ? 'checked' : ''}`
        item.dataset.id = todo.id // Stocker l'ID de la tâche
        item.textContent = todo.text

        if (!todo.checked) {
          const span = document.createElement('span');
          const btnModify = appendChildWithContent('button', 'Modify', ['btn', 'modify']);
          const btnDeleted = appendChildWithContent('button', 'Delete', ['btn', 'deleted']);
          
          span.appendChild(btnModify)
          span.appendChild(btnDeleted)
          item.appendChild(span);

          btnModify.addEventListener('click', () => modifyTodo(todo))
          btnDeleted.addEventListener('click', () => deleteTodo(todo.id))
        }
        todosContainer.appendChild(item)
      })
    } else {
      const item = document.createElement('li');
      item.className = `items`;
      item.textContent = 'Aucune donnée trouvée.';
      todosContainer.appendChild(item);
    }
  }


  const modifyTodo = async function (todo) {
    openModifyModal(todo);
  }

  const deleteTodo = async function (id) {
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      let url = `/api/remove/${id}`
      window.location.href = url; // Redirige
      // await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    }
  }

  // Charger les tâches initiales
  loadTodos(todos)

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