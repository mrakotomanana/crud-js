document.addEventListener('DOMContentLoaded', () => {
  console.log('Page List chargée avec succès !');
  const listItems  = document.querySelectorAll('#todos > li');
  listItems.forEach(item => {
    console.info(item.classList.value);
    if (!item.classList.contains('checked')) {
      var span = document.createElement("span");
      var btnModify = document.createElement("button");
      var btnDeleted = document.createElement("button");
      var txtModify = document.createTextNode("Modifier");
      var txtDeleted = document.createTextNode("Delete");
      btnModify.className = "btn";
      btnModify.appendChild(txtModify);
      span.appendChild(btnModify);
      btnDeleted.className = "btn";
      btnDeleted.appendChild(txtDeleted);
      span.appendChild(btnDeleted);
      item.appendChild(span);
    }
  });
});
