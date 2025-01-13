document.addEventListener('DOMContentLoaded', () => {
  console.log('Page Delete chargée avec succès !');
  const addBtn = document.getElementById('deleteBtn');
  const inputField = document.getElementById('myInput');

  addBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    try {
      const deletedTodo = await Todo.findByIdAndDelete(id);

      if (!deletedTodo) {
        return res.status(404).json({ message: 'Tâche introuvable' });
      }

      res.status(204).end();
    } catch (err) {

    }
  });
});