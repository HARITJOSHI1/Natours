function hideAlert() {
  const el = document.querySelector('.alert'); 
  el.parentElement.removeChild(el);
}

export const renderAlert = (type, msg) => {
  const el = `<div class = "alert alert--${type}"> ${msg} </div>`;
  document.body.insertAdjacentHTML('afterbegin', el);
  window.setTimeout(hideAlert, 5000);
};
