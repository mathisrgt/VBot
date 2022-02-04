// Code géré depuis la fenêtre popup de l'extension

// Configuration de la communication avec background.js
let port = chrome.runtime.connect();

// Récupère les éléments de la popup
let stgs = document.getElementById('settings');
let tuto = document.getElementById('tutorial');
let lk = document.getElementById('like');
let ulk = document.getElementById('unlike');
let flw = document.getElementById('follow');
let uflw = document.getElementById('unfollow');
let snd = document.getElementById('send');
let stp = document.getElementById('stop');
let web = document.getElementById('don');

// Execute la fonction sendToBackground() avec le mot correspondant à l'action souhaitée
stgs.addEventListener('click', function() {
    sendToBackground('settings');
});

tuto.addEventListener('click', function() {
    sendToBackground('tutorial');
});

lk.addEventListener('click', function() {
    sendToBackground('like');
});

ulk.addEventListener('click', function() {
    sendToBackground('unlike');
});

flw.addEventListener('click', function() {
    sendToBackground('follow', 0);
});

uflw.addEventListener('click', function() {
    sendToBackground('unfollow');
});

/*snd.addEventListener('click', function() {
    sendToBackground('send');
});*/

web.addEventListener('click', function() {
    sendToBackground('web');
});

/**
 * Envoie l'index d'une action à effectuer à la page background.js 
 * @param { Integer } idAction L'index de l'action à envoyer
 */
function sendToBackground(idAction, index) {
    port.postMessage({idAction: idAction, index: index});
}