document.addEventListener('DOMContentLoaded', function() {
    const searchResults = document.getElementById('searchResults');
    const pagination = document.getElementById('pagination');

    function loadSearchResults(page = 1) {
      debugger;
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q') || "";
        console.log(urlParams, searchQuery)
        fetch(`/api/search?q=${searchQuery}&page=${page}`)
            .then(res => res.json())
            .then(({
                todos,
                totalPages,
                currentPage
            }) => {
                searchResults.innerHTML = '';
                pagination.innerHTML = '';

                if (todos.length === 0) {
                    searchResults.innerHTML = '<li class="list-group-item text-muted">Aucun résultat trouvé</li>';
                    return;
                }

                todos.forEach((todo) => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';
                    li.innerHTML = `
                      <span>${todo.text} <small class="text-muted">(${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'Non definie'})</small>
                      <small class="text-muted">(${todo.checked ? 'terminé' : 'en cours'})</small></span>
                    `;
                    searchResults.appendChild(li);
                  });
                  if (currentPage> 1) {
                      const li = document.createElement('li');
                      li.className = `page-item`;
                      li.innerHTML = `<a class="page-link" href="#">Précédent</a>`;
                      let i = currentPage - 1;
                      li.addEventListener('click', (e) => {
                        e.preventDefault();
                        loadSearchResults(i);
                      });
                        .appendChild(li);
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
                      loadSearchResults(i);
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
                      loadSearchResults(i);
                    });
                    pagination.appendChild(li);
                 } 
            })
            .catch(err => {
                searchResults.innerHTML = `
                  <div class="alert alert-danger alert-dismissible">
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                    Erreur de chargement des résultats.
                </div>
                `
                console.error('Erreur de chargement des résultats:', err)
            });
    }

    loadSearchResults();
});