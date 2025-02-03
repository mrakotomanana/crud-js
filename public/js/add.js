document.addEventListener('DOMContentLoaded', () => {
  console.log('Page Add chargée avec succès !');
  const addBtn = document.getElementById('addBtn');
  const inputField = document.getElementById('titleInput');
  const dueDate = document.getElementById('dueDate');
  const todoList = document.getElementById('todoList');
  const pagination = document.getElementById('pagination');
  
  addBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const todoText = inputField.value.trim();
    const dueDateText = dueDate.value;
    const dateDone = !dueDateText ? new Date().toISOString().split('T')[0] : new Date(dueDateText);
    if (!todoText ) {
      alert('Veuillez entrer un titre pour le ToDo.');
    } else {
      if (confirm('Voulez-vous vraiment ajouter cette tâche ?')) {
        fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: todoText, dueDate : dateDone }),
        }).then(async (response) => {
          if (response.ok) {
            window.location.href = '/list'; 
          } else {
            const errorResponse = await response.json();
            const errorMessage = Array.isArray(errorResponse.message)
              ? errorResponse.message.join(', ')
              : 'Une erreur est survenue.';

            alert(errorMessage);
            console.error('Erreur :', errorMessage);
            inputField.value = '';
          }
        }).catch((error) => {
          inputField.value = '';
          window.alert('Erreur lors de l\'ajout d\'une Tâche : ', error);
          console.error('Erreur inconnue lors de l\'ajout d\'une Tâche', error);
        });
      }
    }

  });

  function loadTodos(page = 1) {
    fetch(`/api/todos?page=${page}`)
      .then((res) => res.json())
      .then(({ todos, totalPages, currentPage }) => {
        todoList.innerHTML = '';
        pagination.innerHTML = '';

        if (todos.length === 0) {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-center';
          li.innerHTML = `<span class="text-muted">Aucun résultat trouvé</span>`;
          todoList.appendChild(li);
          return;
      }

        todos.forEach((todo) => {
          const li = document.createElement('li');
          li.className = 'list-group-item d-flex justify-content-between align-items-center';
          li.innerHTML = `
            <span>${todo.text} <small class="text-muted">(${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'Non definie'})</small>
            <small class="text-muted">(${todo.checked ? 'terminé' : 'en cours'})</small></span>
          `;
          todoList.appendChild(li);
        });
        if (currentPage> 1) {
            const li = document.createElement('li');
            li.className = `page-item`;
            li.innerHTML = `<a class="page-link" href="#">Précédent</a>`;
            let i = currentPage - 1;
            li.addEventListener('click', (e) => {
              e.preventDefault();
              loadTodos(i);
            });
            pagination.appendChild(li);
         }
        var pageView = currentPage + 2;
        if(pageView > totalPages){
          pageView = totalPages
        }
        for (let i = currentPage; i <= pageView; i++) {
          const li = document.createElement('li');
          li.className = `page-item ${i === currentPage ? 'active' : ''}`;
          li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
          li.addEventListener('click', (e) => {
            e.preventDefault();
            loadTodos(i);
          });
          pagination.appendChild(li);
        }
        if (currentPage < totalPages) {
          const li = document.createElement('li');
          li.className = `page-item`;
          li.innerHTML = `<a class="page-link" href="#">Suivant</a>`;
          let i = currentPage + 1;
          li.addEventListener('click', (e) => {
            e.preventDefault();
            loadTodos(i);
          });
          pagination.appendChild(li);
       } 
      }).catch((err) => console.error('Erreur chargement des tâches:', err));
  }

  loadTodos();
});