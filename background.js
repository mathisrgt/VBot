// Code géré par le navigateur chrome !
const FOLLOW_RANGE = 2000;

const DEFAULT_VALUE = 1;
const DEFAULT_TXT = "Hi, have a look at my dressing room! Currently, for 1 item purchased, you get -20%. Have a nice day :)";

let nbLikeToDo, nbUnlikeToDo, nbFollowToDo, nbUnfollowToDo, nbMessageToSend, txtMessage, delayMin, delayMax;
let i = 0;

chrome.runtime.onInstalled.addListener((details) => {
    const currentVersion = chrome.runtime.getManifest().version
    const previousVersion = details.previousVersion
    const reason = details.reason
    
    console.log('Previous Version: ${previousVersion }')
    console.log('Current Version: ${currentVersion }')
 
    switch (reason) {
       case 'install':
            chrome.storage.sync.set({
                'like': DEFAULT_VALUE, 
                'unlike': DEFAULT_VALUE, 
                'follow': DEFAULT_VALUE, 
                'unfollow': DEFAULT_VALUE, 
                'nbMessage': DEFAULT_VALUE,
                'txtMessage': DEFAULT_TXT,
                'delayMin': DEFAULT_VALUE,
                'delayMax': (DEFAULT_VALUE + 1)
            });
          break;
       case 'update':
          //console.log('User has updated their extension.')
          break;
       case 'chrome_update':
       case 'shared_module_update':
       default:
          //console.log('Other install events within the browser')
          break;
    }
 
 })

initData(nbLikeToDo, nbUnlikeToDo, nbFollowToDo, nbUnfollowToDo, nbMessageToSend);

// ------------ COMMUNICATION ---------------
chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
        switch(request.idAction) {
            case 'settings':
                chrome.tabs.create({'url': "/options/options.html"});
                break;
            case 'tutorial':
                chrome.tabs.create({'url': "./ReadMe.txt"});
                break;
            case 'like':
                like(nbLikeToDo);
                break;
            case 'unlike':
                unlike(nbUnlikeToDo);
                break;
            case 'follow':
                if(i == 24) {
                    i = 0;
                    changeSearchPage('follow');
                } else {
                    selectProfil(i);
                }
                break;
            case 'followOnPage':
                i = request.index;
                followOnPage(request.url);
                break;
            case 'unfollow':
                unfollow();
                break;
            case 'send':
                if(i == 30) {
                    i = 0;
                    changeSearchPage('send');
                } else {
                    selectFollower(i);
                }
                break;
            case 'selectContact':
                i = request.index;
                sendToContent('selectContact', request.url);
                break;
            
            case 'sendMessage':
                sendToContent('sendMessage', request.url);
                break;

            case 'web':
                chrome.tabs.create({'url': "https://www.paypal.com/donate?hosted_button_id=BYC5AEEL66ZZU"});
                break;
            default:
                console.log("Invalid action index received in background !");
        }
    });
})

// ------------ FONCTIONS AUXILIAIRE --------------
function sleep(miliseconds) {
    var currentTime = new Date().getTime();
    while (currentTime + miliseconds >= new Date().getTime()) {}
}

function initData() {
    chrome.storage.sync.get(['like', 'unlike', 'follow', 'unfollow', 'nbMessage', 'txtMessage', 'delayMin', 'delayMax'], function(result) {
            nbLikeToDo = result.like;
            nbUnlikeToDo = result.unlike;
            nbFollowToDo = result.follow;
            nbUnfollowToDo = result.unfollow;
            nbMessageToSend = result.nbMessage;
            txtMessage = result.txtMessage;
            delayMin = result.delayMin;
            delayMax = result.delayMax;
    });

}

/**
 * Envoie l'index d'une action à effectuer à la page content.js 
 * @param { Integer } idAction L'index de l'action à envoyer
 */
function sendToContent(idAction, nbAction, chgPage) {
    sleep(4000);
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {idAction: idAction, nbAction: nbAction, chgPage: chgPage});
    });
}

/**
 * Retourn l'url de la page courante
 * @param { chrome.tabs } idAction Les onglets ouverts
 */
function getURL(tabs) {
    return tabs[0].url;
}

/**
 * Retourn si la page courante est la page d'accueil Vinted
 * @param { chrome.tabs } idAction Les onglets ouverts
 */
function isHomePage(tabs) {
    return (getURL(tabs) == "https://www.vinted.fr/") ? true : false;
}

// ------------ FONCTIONS PRINCIPALES --------------
function like(nbLikeToDo) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if(isHomePage(tabs)) {
            sendToContent('like', nbLikeToDo, false);
        } else if (getURL(tabs).includes("https://www.vinted.fr/vetements")) {
            if(nbLikeToDo > 24) {
                sendToContent('like', 24, true);
                nbLikeToDo -= 24;
            }
            else {
                sendToContent('like', nbLikeToDo, false);
                nbLikeToDo -= nbLikeToDo;
            }
        } else {
            alert("Are you sure you are on the right page? To run LIKE, go to the home page or a search page.");
        }
    });
}

function unlike(nbUnlikeToDo) {
    sendToContent('unlike', nbUnlikeToDo);
}

function changeSearchPage(actionName) {
    sendToContent('changeSearchPage', actionName);
}

function selectProfil(id) {
    sendToContent('selectProfil', id);
    sleep(FOLLOW_RANGE);
}

function followOnPage(url) {
    sendToContent('followOnPage', url);
    sleep(FOLLOW_RANGE);
}

function unfollow() {
    if(nbUnfollowToDo > 30) {
        sendToContent('unfollow', 30, true);
        nbUnfollowToDo -= 30;
    }
    else {
        sendToContent('unfollow', nbUnfollowToDo, false);
        nbUnfollowToDo -= nbUnfollowToDo;
    }
}

function selectFollower(id) {
    sendToContent('selectFollower', id);
    sleep(FOLLOW_RANGE);
}
