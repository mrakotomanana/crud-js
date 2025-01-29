document.addEventListener('DOMContentLoaded', () => {
    console.log('Page print chargée avec succès !');
    const todoList = document.getElementById('todoList');
    const pagination = document.getElementById('pagination');
  
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