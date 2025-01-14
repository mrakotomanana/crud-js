document.addEventListener('DOMContentLoaded', () => {
  console.log('Page Add chargée avec succès !');
  const addBtn = document.getElementById('addBtn');
  const inputField = document.getElementById('titleInput');

  addBtn.addEventListener('click', function (e) {
    e.preventDefault();

    const todoText = inputField.value.trim();
    if (!todoText) {
      alert('Veuillez entrer un titre pour le ToDo.');
    } else {
      if (confirm('Voulez-vous vraiment ajouter cette tâche ?')) {
        fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: todoText }),
        }).then((response) => {
          if (response.ok) {
            window.location.href = '/list'; // Redirige vers la liste des ToDos
          } else {
            console.error('Erreur lors de l\'ajout du ToDo');
          }
        }).catch((error) => {
          console.error('Erreur réseau :', error);
        });
      }
    }

  });
});