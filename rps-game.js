class RpsGame {

    constructor(p1, p2) {
        this._players = [p1, p2];
        this._initState();
        this._score = [0, 0];
        this._names = [null, null];
        this._rematch = [null, null];
        this._sendToPlayers('Connect 4 game starts now!!');
        this._sendToPlayer(0, "Your turn");
        this._nextPlayerIndex = 0;

        this._players.forEach((player, idx) => {
            player.on('turn', (turn) => {
                this._onTurn(idx, turn)
            });
        });
        this._players.forEach((player, idx) => {
            player.on('name', (name) => {
                this._onName(idx, name)
            });
        });
        this._players.forEach((player, idx) => {
            player.on('new-game', () => {
                this._players[this._otherPlayerIndex(idx)].emit('forcedReload');
            });
        });
        this._players.forEach((player, idx) => {
            player.on('rematch', () => {
                this._rematch[idx] = true;
                if (this._rematch[0] && this._rematch[1]) {
                    this._players.forEach((player) => player.emit('rematch'));
                    this._initState();
                    this._rematch = [null, null];
                }
            });
        });
    }

    _initState(){
        this._state = [
            [null, null, null, null, null, null,],
            [null, null, null, null, null, null,],
            [null, null, null, null, null, null,],
            [null, null, null, null, null, null,],
            [null, null, null, null, null, null,],
            [null, null, null, null, null, null,],
            [null, null, null, null, null, null,]
        ]
    }

    _sendToPlayer(playerIndex, msg) {
        this._players[playerIndex].emit('message', msg);
    }

    _sendToPlayers(msg) {
        this._players.forEach((player) => player.emit('message', msg));
    }
    _sendTurnPlayed(turn, playerIndex) {
        this._players.forEach((player) => player.emit('turn', turn, playerIndex));
    }

    _onTurn(playerIndex, turn) {
        if (playerIndex != this._nextPlayerIndex) return;
        this._regiserTurnResult(turn, playerIndex);
        this._nextPlayerIndex = this._otherPlayerIndex(playerIndex);
        this._sendToPlayer(this._nextPlayerIndex, "Your turn");

    }
    _onName(playerIndex, name) {
        this._names[playerIndex] = name;
        if (this._names[0] && this._names[1]) {
            this._players.forEach((player) => {
                this._names.forEach((name, i) => { player.emit('name', name, i) })

            });
        }
    }
    _endGame(playerIndex) {
        this._score[playerIndex]++;
        this._sendScore();
        this._players[playerIndex].emit('end', "VICTORY !!");
        this._players[this._otherPlayerIndex(playerIndex)].emit('end', "DEFEAT :(");
    }
    _regiserTurnResult(turn, playerIndex) {
        const cell = [];
        const turnArr = Array.from(turn);
        cell.push(turnArr[6]); //r-x
        cell.push(turnArr[3]); // col-y
        // cell est sous la forme [x,y]

        const firstFreeX = this._state[cell[1]].lastIndexOf(null);
        if (firstFreeX == -1) { // c'est plein il aurait pas du pouvoir cliquer la, encore a lui de jouer
        }
        else {
            console.log(`cliqué x=${cell[0]}  et y= ${cell[1]}`)
            console.log(`add x= ${firstFreeX} et y= ${cell[1]}`)
            // update
            this._state[cell[1]][firstFreeX] = playerIndex;
            console.table(this._state);
            // envoi aux clients
            const validTurn = `col${turnArr[3]}-r${firstFreeX}`
            this._sendTurnPlayed(validTurn, playerIndex);
            console.log(`cell ajoutée : ${[[cell[1]], [firstFreeX]]}`)
            if (this._checkGameOver([[cell[1]], [firstFreeX]], playerIndex)) {
                this._endGame(playerIndex)
            }
        }
    }

    _otherPlayerIndex(playerIndex) {
        return (playerIndex) ? 0 : 1;
    }
    _checkGameOver(cell, playerIndex) {
        //cell s'inverse par rapport a _registerTurnResult 
        let vertical = 0;
        let horizontal = 0;
        let diag1 = 0;
        let diag2 = 0;
        let hAddContinue = true;
        let hMinusContinue = true;
        let d1AddContinue = true;
        let d1MinusContinue = true;
        let d2AddContinue = true;
        let d2MinusContinue = true;



        for (let i = 0; i < 5; i++) {  // this._state[y][x]
            console.log(`i=${i}`)
            // on va check en vertical en premier
            if (this._state[cell[0]][parseInt(cell[1]) + parseInt(i)]!= undefined && 
            this._state[cell[0]][parseInt(cell[1]) + parseInt(i)] == playerIndex) {
                vertical++;
            }
            // puis horizontal
            if (hAddContinue && // si on a pas atteint une case d'une autre couleur
                this._state[parseInt(cell[0]) + parseInt(i)] != undefined && // que la pos en y existe
                this._state[parseInt(cell[0]) + parseInt(i)][parseInt(cell[1])] == playerIndex)// que la couleur correspond 
            { horizontal++; }
            else hAddContinue = false;
            if (hMinusContinue &&
                this._state[parseInt(cell[0]) - parseInt(i) - 1] != undefined &&
                this._state[parseInt(cell[0]) - parseInt(i) - 1][parseInt(cell[1])] == playerIndex) { horizontal++; }
            else hMinusContinue = false;

            // puis diagonale dans un sens
            if (d1AddContinue && // si on a pas atteint une case d'une autre couleur
                this._state[parseInt(cell[0]) + parseInt(i)] != undefined && // que la pos en y existe
                this._state[parseInt(cell[0]) + parseInt(i)][parseInt(cell[1]) + parseInt(i)] == playerIndex)// que la couleur correspond 
            { diag1++; }
            else d1AddContinue = false;
            if (d1MinusContinue &&
                this._state[parseInt(cell[0]) - parseInt(i) - 1] != undefined &&
                this._state[parseInt(cell[0]) - parseInt(i) - 1][parseInt(cell[1]) - parseInt(i) - 1] == playerIndex) { diag1++; }
            else d1MinusContinue = false;

            // diagonale dans l'autre
            if (d2AddContinue && // si on a pas atteint une case d'une autre couleur
                this._state[parseInt(cell[0]) + parseInt(i)] != undefined && // que la pos en y existe
                this._state[parseInt(cell[0]) + parseInt(i)][parseInt(cell[1]) - parseInt(i)] == playerIndex)// que la couleur correspond 
            { diag2++; }
            else d2AddContinue = false;
            if (d2MinusContinue &&
                this._state[parseInt(cell[0]) - parseInt(i) - 1] != undefined &&
                this._state[parseInt(cell[0]) - parseInt(i) - 1][parseInt(cell[1]) + parseInt(i) + 1] == playerIndex) { diag2++; }
            else d2MinusContinue = false;
        }
        if (vertical >= 4 || horizontal >= 4 || diag1 >= 4 || diag2 >= 4) { return true; }
        return false;

    }


    _sendWinMessage(winner, loser) {
        console.log(`sending win msg to winner ${winner} and loser ${loser}`);
        winner.emit('message', 'You won');
        loser.emit('message', 'You lost');
        this._sendToPlayers(`Score : ` + this._score.join(' - '));
        this._sendScore();
    }


    _sendScore() {
        this._players.forEach((player) => player.emit('score', this._score.join(' - ')));
    }
}
module.exports = RpsGame; //nodejs way of erxporting things