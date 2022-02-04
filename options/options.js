let nbLikes = document.getElementById('nb_likes');
let nbUnlikes = document.getElementById('nb_unlikes');
let nbFollows = document.getElementById('nb_follows');
let nbUnFollows = document.getElementById('nb_unfollows');
let nbMessages = document.getElementById('nb_messages');

let txtMessage = document.getElementById('txt_message');

let nbDelayMin = document.getElementById('nb_min');
let nbDelayMax = document.getElementById('nb_max');

let downBtns = document.getElementsByClassName('down-btn');
let upBtns = document.getElementsByClassName('up-btn');
let inputs = document.getElementsByTagName('input');

let saveBtns = document.getElementsByClassName('save-btn');

let donationBtn = document.getElementById('donation-btn');
let reportBtn = document.getElementById('report-btn');

/* Gestion des boutons de quantité */
for (let i = 0; i < downBtns.length; ++i) {
    downBtns[i].addEventListener('click', function() {
        let ipt = inputs[i];
        if(ipt.value > 1) {
            ipt.style.color = "#000000";
            ipt.value -= 1;
            switch(i) {
                case 5:
                    shadowBtn(saveBtns[2]);
                    break;
                case 6:
                    shadowBtn(saveBtns[2]);
                    break;
                default:
                    shadowBtn(saveBtns[0]);
            }
        } else {
            ipt.style.color = "#BC0000";
        }
    });

    upBtns[i].addEventListener('click', function() {
        let ipt = inputs[i];
        if(ipt.value < 99) {
            ipt.style.color = "#000000";
            ipt.value = parseInt(inputs[i].value) + 1;
            switch(i) {
                case 5:
                    shadowBtn(saveBtns[2]);
                    break;
                case 6:
                    shadowBtn(saveBtns[2]);
                    break;
                default:
                    shadowBtn(saveBtns[0]);
            }
        } else {
            ipt.style.color = "#BC0000";
        }
    });
}

/* Gestion de la sauvegarde */
chrome.storage.sync.get(['like', 'unlike', 'follow', 'unfollow', 'nbMessage', 'txtMessage', 'delayMin', 'delayMax'], function(result) {
    nbLikes.value = result.like;
    nbUnlikes.value = result.unlike;
    nbFollows.value = result.follow;
    nbUnFollows.value = result.unfollow;
    nbMessages.value = result.nbMessage;
    txtMessage.value = result.txtMessage;
    nbDelayMin.value = result.delayMin;
    nbDelayMax.value = result.delayMax;    
});

for(let i = 0; i < saveBtns.length; ++i) {
    saveBtns[i].addEventListener('click', function(){
        if(nbDelayMin.value == nbDelayMax.value) {
            alert("DelayMin and DelayMax must not have the same value.");
        }
        else if (nbDelayMin.value > nbDelayMax.value) {
            alert("DelayMin must not have a higher value than DelayMax.");
        } else {
            chrome.storage.sync.set({
                'like': nbLikes.value, 
                'unlike': nbUnlikes.value, 
                'follow': nbFollows.value, 
                'unfollow': nbUnFollows.value, 
                'nbMessage': nbMessages.value,
                'txtMessage': txtMessage.value,
                'delayMin': nbDelayMin.value,
                'delayMax': nbDelayMax.value
            });
    
            for(let i = 0; i < saveBtns.length; ++i) {
                saveBtns[i].style.boxShadow = "";
            }
        }
        
        chrome.storage.sync.get(['like', 'unlike', 'follow', 'unfollow', 'nbMessage', 'txtMessage', 'delayMin', 'delayMax'], function(result) {
            nbLikes.value = result.like;
            nbUnlikes.value = result.unlike;
            nbFollows.value = result.follow;
            nbUnFollows.value = result.unfollow;
            nbMessages.value = result.nbMessage;
            txtMessage.value = result.txtMessage;
            nbDelayMin.value = result.delayMin;
            nbDelayMax.value = result.delayMax;
        });
    });
}

/* Gestion du shadow du bouton d'enregistrement */
nbLikes.addEventListener('change', function() { shadowBtn(saveBtns[0]); });
nbUnlikes.addEventListener('change', function() { shadowBtn(saveBtns[0]); });
nbFollows.addEventListener('change', function() { shadowBtn(saveBtns[0]); });
nbUnFollows.addEventListener('change', function() { shadowBtn(saveBtns[0]); });
nbMessages.addEventListener('change', function() { shadowBtn(saveBtns[0]); });

txtMessage.addEventListener('change', function() { shadowBtn(saveBtns[1]); });

nbDelayMin.addEventListener('change', function() { shadowBtn(saveBtns[2]); });
nbDelayMax.addEventListener('change', function() { shadowBtn(saveBtns[2]); });

function shadowBtn(btn) {
    btn.style.boxShadow = "0.2em 0.1em 0.1em #c9c9c9";
}

donationBtn.addEventListener('click', function() {
    window.open("https://www.paypal.com/donate?hosted_button_id=BYC5AEEL66ZZU");
});

reportBtn.addEventListener('click', function() {
    alert("If you have a problem or a suggestion, please contact me at the following email address: ***vbot.extension@gmail.com***. Thank you.");
});