// Déclaration des constantes
const NB_HOMEPAGE_BOXVIEW = 5;
const NB_PAGE_BOXVIEW = 4;

const NB_PIXELS_SCROLL_LIKE_PAGE = 475;
const NB_PIXELS_SCROLL_UNLIKE_PAGE = 435;
const NB_PIXELS_SCROLL_UNFOLLOW_PAGE = 200;

const CLASS_NAME_LIKE_BUTTONS = 'ItemBox_favourites__-GaGH ItemBox_clickable__2nQ-Y';
const CLASS_NAME_UNFOLLOW_BUTTONS = 'c-button-- c-button--default c-button--small c-button  __act_as_terms_protected js-toggle-favourite-state c-button--truncated is-fav-loaded';
const CLASS_NAME_FOLLOW_BUTTONS = 'Button_button__1HmfN Button_filled__ShyyU Button_primary__7rvYY Button_truncated__3pQ92';
const CLASS_NAME_USERS_NAME = 'Cell_link__1q9hy';
const CLASS_NAME_CONTACT_BUTTONS = 'Button_button__1HmfN Button_medium__1Kljk Button_primary__7rvYY Button_inline__3k2so Button_truncated__3pQ92';
const CLASS_NAME_FOLLOWERS_NAME = 'follow__name';
const CLASS_NAME_SEND_BUTTON_DISABLED = 'Button_button__1HmfN Button_flat__34jig Button_muted__3hngQ Button_inline__3k2so Button_disabled__2H3BP Button_truncated__3pQ92 Button_icon-left__1QZEf Button_without-text__3li-d';
const CLASS_NAME_INPUT = 'composerInput';
const CLASS_NAME_SEND_BUTTON = 'Button_button__1HmfN Button_flat__34jig Button_muted__3hngQ Button_inline__3k2so Button_truncated__3pQ92 Button_icon-left__1QZEf Button_without-text__3li-d';

const TXT_NB_REACHED = "Fantastic! The number of articles requested has been reached!";
const TXT_ERROR_PAGE = "Are you sure you are on the right page? ";

// Code géré depuis la page web courante (content.js)
let port = chrome.runtime.connect();

// Détection des modifications
chrome.storage.onChanged.addListener(function() {
    alert("The VBot options have been modified. Please close and reopen Chrome to apply the changes.");
});

// Gestion des comportements en fonction de la page active
let url = getURL();

// Déclaration des variables globales
let nbItem = 0;
let nbClicks = 0;
let pxScroll = 400;

let delayMin, delayMax;
chrome.storage.sync.get(['delayMin', 'delayMax'], function(result) {
    delayMin = result.delayMin;
    delayMax = result.delayMax;
});

// ------------ RECUPERE LES INDICES DE LANCEMENT DE FONCTIONS ------------
chrome.runtime.onMessage.addListener(function(request) {
    switch(request.idAction) {

        case 'like':
            like(request.nbAction, delayMin, delayMax, request.chgPage);
            break;

        case 'unlike':
            if(getURL() == 'https://www.vinted.fr/member/items/favourite_list') {
                unlike(request.nbAction, delayMin, delayMax);
            } else {
                alert(TXT_ERROR_PAGE + "To run UNLIKE, go to the page of your favorite articles.");
            }
            break;

        case 'changeSearchPage':
            changeSearchPage(request.nbAction);
            break;

        case 'selectProfil':
            if(url.includes('https://www.vinted.fr/vetements?')){
                nbItem = request.nbAction;
                selectProfil(nbItem, url);
            } else {
                alert(TXT_ERROR_PAGE + "To run FOLLOW, go to a search page.");
            }
            break;

        case 'followOnPage':
            followOnPage(request.nbAction);
            break;

        case 'unfollow':
            if(getURL().includes('https://www.vinted.fr/member/general/following/')) {
                nbItem = 0;       
                unfollow(request.nbAction, delayMin, delayMax, request.chgPage);
            } else {
                alert(TXT_ERROR_PAGE + "To run UNFOLLOW, go to your subscriptions page.");
            }
            break;

        case 'selectFollower':
            url = getURL();
            if(url.includes('https://www.vinted.fr/member/general/followers/')) {
                nbItem = request.nbAction;
                selectFollower(nbItem, url);
            } else {
                alert(TXT_ERROR_PAGE + "To run SEND MESSAGE, go to your account's subscriber page.");
            }
            break;

        case 'selectContact':
            selectContact(request.nbAction);
            break;

        case 'sendMessage':
            sendMessage(message, request.nbAction);
            break;

        default:
            console.log("Unknown action for VBot.");
    }
});

// ------------ FONCTIONS PRINCIPALES (DE GESTION GLOBALE) ------------

function like(nbLikeToDo, delayMin, delayMax, chgPage) {

    let nbBoxView = NB_HOMEPAGE_BOXVIEW;

    if(chgPage) {
        nbBoxView = NB_PAGE_BOXVIEW;
        window.scroll(0, pxScroll);
    }

    likeOnPage(getLikeButtons(), delayMin, delayMax, nbLikeToDo, chgPage, nbBoxView);
}

function unlike(nbUnlikeToDo, delayMin, delayMax) {
    unlikeOnPage(getLikeButtons(), delayMin, delayMax, nbUnlikeToDo);
}

function unfollow(nbUnfollowToDo, delayMin, delayMax, chgPage) {
    unfollowOnPage(getUnfollowButtons(), delayMin, delayMax, nbUnfollowToDo, chgPage);
}

// ------------ FONCTIONS OBTENIR ELEMENTS SUR LE DOM ------------
function getLikeButtons() {
    return document.getElementsByClassName(CLASS_NAME_LIKE_BUTTONS);
}

function getStyleFromLikeButton(i) {
    return getComputedStyle(getLikeButtons()[i].getElementsByTagName('svg')[0]);
}

function getUnfollowButtons() {
    return document.getElementsByClassName(CLASS_NAME_UNFOLLOW_BUTTONS);
}

function getFollowButton() {
    return document.getElementsByClassName(CLASS_NAME_FOLLOW_BUTTONS);
}

function getUsersName() {
    return document.getElementsByClassName(CLASS_NAME_USERS_NAME);
}

function getContactButton() {
    return document.getElementsByClassName(CLASS_NAME_CONTACT_BUTTONS);
}

function getFollowersName() {
    return document.getElementsByClassName(CLASS_NAME_FOLLOWERS_NAME);
}

// ------------ FONCTIONS AUXILIAIRES (DE TRANSITIONS) ------------
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function getURL() {
    return String(window.location);
}

function changeSearchPage(sendingRq) { // = changeFollowersPage

    url = getURL();
    if(url.includes("&page=")) {
        url = url.replaceAt((url.length - 1), String(parseInt(url.charAt(url.length - 1)) + 1));
    } else {
        url += "&page=2";
    }
    window.location = url;
    
    if(sendingRq != undefined) {
        sendToBackground(sendingRq);
    }
}

function changeFollowersPage(sendingRq) {
    
    url = getURL();
    if(url.includes("page=")) {
        url = url.replaceAt((url.length - 1), String(parseInt(url.charAt(url.length - 1)) + 1));
    } else {
        url += "?page=2";
    }
    window.location = url;
    
    if(sendingRq) {
        sendToBackground('follow');
    }
}

function selectProfil(i) {
    getUsersName()[i].click();
    sendToBackground('followOnPage', ++nbItem, getURL());
}

function sendToBackground(idAction, index, url) {
    port.postMessage({idAction: idAction, index: index, url: url});
}

function selectContact(url) {
    getContactButton()[1].click();
    sendToBackground('sendMessage', 0, url);
}

function selectFollower(i) {
    getFollowersName()[0].click();
    sendToBackground('selectContact', ++i, getURL());
}

// Scroll si nécessaire
function scrollOnPage(nbBoxView, nbPixels) {
    // alert("nbItem = " + nbItem + " ; nbBoxView = " + nbBoxView);
    if ((nbItem % nbBoxView == 0) && (nbItem != 0)) {
        pxScroll += nbPixels;
        window.scroll(0, pxScroll);
    }
}

function randomInt(min, max) {
    let nb = 0;
    while(nb > max || nb < min) {
        nb = Math.random() * 10;
    }
    return nb * 1000;
}

// ------------ FONCTIONS D'ACTION - (LE PLUS SOUVENT RECURCIVES)------------
function likeOnPage(btns, delayMin, delayMax, nbLikeToDo, chgPage, nbBoxView) {

    setTimeout(function() {

        // Essaie de cliquer sur le coeur
        if(getStyleFromLikeButton(nbItem).fill == "rgb(221, 221, 221)") {
            btns[nbItem].click();
            ++nbClicks;
        } else {
            console.log("Article #" + nbItem + " has already been liked.")
        }

        scrollOnPage(nbBoxView, NB_PIXELS_SCROLL_LIKE_PAGE);

        // Passe à l'article suivant
        ++nbItem;

        // Si le nombre d'article total aimé est inférieur à la demande => PROCHAIN ARTICLE (RECURSSIF)
        if(nbItem < nbLikeToDo) {
            likeOnPage(btns, delayMin, delayMax, nbLikeToDo, chgPage, nbBoxView);
        }
        // Si tous les articles de la page ont été aimés mais toujours inférieur à la demande => CHANGEMENT DE PAGE
        else if(chgPage) {
            changeSearchPage('like');
            sendToBackground('like');
        }
        // Si le nombre d'article total aimé est atteint la demande => FIN
        else {
            alert(TXT_NB_REACHED);
        }
        
    }, randomInt(delayMin, delayMax));
}

function unlikeOnPage(btns, delayMin, delayMax, nbUnlikeToDo) {

    setTimeout(function() {

        // Essaie de cliquer sur le coeur
        if(getStyleFromLikeButton(nbItem).fill == "rgb(240, 62, 83)") {
            try {
                btns[nbItem].click();
                ++nbClicks;
            } catch {
                alert("All items have been processed!");
                return;
            }
        } else {
            console.log("Article #" + nbItem + " has already been unliked.")
        }
        
        scrollOnPage(NB_PAGE_BOXVIEW, NB_PIXELS_SCROLL_UNLIKE_PAGE);

        // Passe à l'article suivant
        ++nbItem;

        // Si le nombre d'article total aimé est inférieur à la demande => PROCHAIN ARTICLE (RECURSSIF)
        if(nbClicks < nbUnlikeToDo) {
            unlikeOnPage(btns, delayMin, delayMax, nbUnlikeToDo);
        }
        // Si nb articles total = demande => FIN
        else {
            alert(TXT_NB_REACHED);
        }
        
    }, randomInt(delayMin, delayMax));
}

function followOnPage(url) {

    // Essaie de cliquer sur le bouton d'abonnement supposé 'non-cliqué'
    try {
        getFollowButton()[0].click();
    } catch (e) {
        console.log("We are already subscribed to this user!");
    }

    // On revient à la page initiale (page des abonnements)
    window.location = url;

    // On informe le Background.js de relancer la procedure follow
    sendToBackground('follow');
}

function unfollowOnPage(btns, delayMin, delayMax, nbUnfollowToDo, chgPage) {

    setTimeout(function() {
        
        // Clique sur le bouton de désabonnement courant
        btns[nbItem].click();

        scrollOnPage(NB_PAGE_BOXVIEW, NB_PIXELS_SCROLL_UNFOLLOW_PAGE);

        // Passe à l'article suivant
        ++nbItem;

        // Si le nombre de personnes total aimé est inférieur à la demande => PROCHAIN ARTICLE (RECURSSIF)
        if(nbItem < nbUnfollowToDo) {
            unfollowOnPage(btns, delayMin, delayMax, nbUnfollowToDo, chgPage);
        }
        // Si tous les articles de la page ont été aimés mais toujours inférieur à la demande => CHANGEMENT DE PAGE
        else if(chgPage) {
            changeSearchPage('unfollow');
            sendToBackground('unfollow');
        } 
        // Si nb articles total = demande => FIN
        else {
            alert(TXT_NB_REACHED);
        }
        
    }, randomInt(delayMin, delayMax));
}

function sendMessage(message, url) {
    let sendBtn = document.getElementsByClassName(CLASS_NAME_SEND_BUTTON_DISABLED);
    sendBtn[0].classList.remove("Button_disabled__2H3BP");

    let ipt = document.getElementById(CLASS_NAME_INPUT);
    sendBtn = document.getElementsByClassName(CLASS_NAME_SEND_BUTTON);
    
    ipt.innerText = message;
    sendBtn[0].click();

    window.location = url;
    sendToBackground('send');
}