

const writeEvent = (text) => {
    // <ul> elem
    const parent = document.querySelector('#events');

    // <li> elem
    const el = document.createElement('li');
    el.innerHTML = text;

    parent.appendChild(el);
    parent.scrollTop = parent.scrollHeight;
};

const writeScore = (score) => {
    const el = document.querySelector('#score');
    el.innerHTML = ` ${score} `
}
const writeName = (name, idx) => {
    const el = document.querySelector(`#name-p${idx} `);
    el.innerHTML = name;
}
const addToken =(turn, playerIndex) =>{
    const el = document.getElementById(turn);
    el.classList.add(`player${playerIndex}`);
}

const askName = () => {
    document.getElementById("myModal").style.display = "block";
}

const askAgain = (victoryOrDefeat)=>{
    document.getElementById("end-text").innerHTML = victoryOrDefeat;
    document.getElementById("endModal").style.display = "block";
}

const addButtonListeners = () => {
    // mettre les onclic sur les cases
    cases = Array.from(document.getElementsByClassName("case"));
    cases.forEach((e)=> {
    e.addEventListener('click', () => {
        sock.emit('turn', e.id);
    });
});
// mettre les onclick sur les boutons du menu de fin de partie
document.getElementById("rematch").addEventListener('click', () => {
    document.getElementById("rematch").style.display='none';
    document.getElementById("end-waiting").style.display='block';
    sock.emit('rematch');
});
document.getElementById("new-game").addEventListener('click', ()=>{
    sock.emit("new-game");
    window.location.reload();
});
}

const onFormSubmitted = (e) => {
    e.preventDefault();
    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = "";
    sock.emit('message', text);
};

const onNameSubmitted = (e) => {
    e.preventDefault();
    const input = document.querySelector('#name');
    const text = input.value;
    //  localStorage.setItem("name", JSON.stringify(text));
    document.getElementById("myModal").style.display = "none";
    sock.emit('name', text); //on envoie le nom pour le collegue
};

const forcedReload = ()=>{
    if(!alert(`The other player don't want to play anymore`)){window.location.reload();}
}

const playAgain = () =>{
    let cells;
    for (let i = 0; i < 2; i++) {
        cells = Array.from(document.getElementsByClassName(`player${i}`));
        cells.forEach(cell => cell.classList.remove(`player${i}`));
    }
    document.getElementById("endModal").style.display = "none";
    document.getElementById("end-waiting").display='none';
}

writeEvent("Welcome to RPS");

const sock = io();
sock.on('message', writeEvent);
sock.on('score', writeScore);
sock.on('name', writeName);
sock.on('askName', askName);
sock.on('turn', addToken);
sock.on('end', askAgain);
sock.on('forcedReload', forcedReload);
sock.on('rematch', playAgain)

document
    .querySelector('#chat-form')
    .addEventListener('submit', onFormSubmitted);

document
    .querySelector('#name-form')
    .addEventListener('submit', onNameSubmitted);

addButtonListeners();