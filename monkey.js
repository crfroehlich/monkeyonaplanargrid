(function() {

    /**
     * Get the sum of the digits of any two numbers using their absolute value.
     */
    function getCoordinateSum(x, y) {
        function sumOfDigits(aNumber) {
            var ret = null;
            var ints = (aNumber + '').split('');
            ret = ints.reduce(function(curr, prev) {
                return (+curr) + (+prev);
            });
            return ret;
        }

        function getAbsString(num) {
            return '' + Math.abs(num);
        }

        function concatNums(num1, num2) {
            return getAbsString(num1) + '' + getAbsString(num2);
        }

        return sumOfDigits(concatNums(x, y));
    }

    //Begin init DOM refs   

    var pleaseBePatient = document.getElementById('patience');
    var monkeyGame = document.getElementById('monkey_game');
    var monkeyGameAnswer = document.getElementById('monkey_game_answer');
    var monkeyGameRules = document.getElementById('monkey_game_rules');
    var monkeyGameBoard = document.getElementById('monkey_game_board');

    var inputs = Object.create(null, {
        height: {
            value: document.getElementById('textfield_height')
        },
        width: {
            value: document.getElementById('textfield_width')
        }
    });
    inputs.height.disabled = true;
    inputs.width.onchange = function() {
        var val = inputs.width.value;
        state.height = val;
        state.width = val;
    };

    var buttons = Object.create(null, {
        reset: {
            value: document.getElementById('button_reset')
        },
        run: {
            value: document.getElementById('button_run')
        },
        rules: {
            value: document.getElementById('button_rules')
        },
        step: {
            value: document.getElementById('button_step')
        }
    });

    buttons.reset.onclick = resetState;
    buttons.run.onclick = toggleRunningState;
    buttons.rules.onclick = showRules;
    buttons.step.onclick = stepOnce;

    function toggleAllInteractives(disable) {
        buttons.reset.disabled = disable;
        buttons.run.disabled = disable;
        buttons.rules.disabled = disable;
        buttons.step.disabled = disable;

        inputs.width.disabled = disable;
    }

    //End init DOM refs

    //Begin init State objs

    var state = Object.create(null, {
        keepStepping: {
            value: false,
            writable: true
        },
        isShowingRules: {
            value: false,
            writable: true
        },
        stepCount: {
            value: 1, //initializing state (therefore the board) counts as the first step
            writable: true
        },
        height: {
            get: function() {
                return inputs.height.value;
            },
            set: function(val) {
                if (1 !== val % 2) {
                    val = (+val) + 1;
                }
                inputs.height.value = val;
            }
        },
        width: {
            get: function() {
                return inputs.width.value;
            },
            set: function(val) {
                if (1 !== val % 2) {
                    val = (+val) + 1;
                }
                inputs.width.value = val;
            }
        },
        zero: {
            value: function() {
                return Math.round(state.height / 2);
            }
        }
    });

    function resetState() {
        toggleAllInteractives(true);

        //Reset common state vals
        state.keepStepping = false;
        state.isShowingRules = false;
        state.stepCount = 1;

        console.time('Board rendering.');

        //As we scale up the grid size for testing, leave some feedback that this will take a moment or two
        setTimeout(function wait() {
            if (state.cellCollections) { //unfortunately, the return happens fast enough that this will usually be initialized.
                monkeyGame.style.display = 'inline';
                pleaseBePatient.style.display = 'none';
                pleaseBePatient.innerHTML = '';
                toggleAllInteractives(false);
                console.timeEnd('Board rendering.');
            }
            else {
                pleaseBePatient.innerHTML += '.';
                setTimeout(wait, 100);
            }
        }, 100);

        //reinit the game board
        state.cellCollections = createBoard();

        //Reset the run button text
        buttons.run.innerHTML = 'Run Test';
        buttons.run.title = 'Start the algorithm';

        updateAnswerText();
    }
    //This is the first run, but it's easiest to 'reset' state at the moment
    resetState();

    function updateAnswerText() {
        var moves = window.monkeyMath.solution;
        if (state.cellCollections) {
            var numoves = (state.cellCollections.hot.length + state.cellCollections.warm.length);
            if(numoves > 1) {
                moves = numoves;
            }
        } 
        monkeyGameAnswer.innerHTML = 'The monkey can move to ' + moves + ' coordinates. Calculated over ' + state.stepCount + ' iterations.';
    }

    function toggleRunningState() {
        state.keepStepping = !(state.keepStepping);
        (function toggleRunButton() {
            if (state.keepStepping) {
                buttons.run.innerHTML = 'Stop Test';
                buttons.run.title = 'Stop the algorithm';
            }
            else {
                buttons.run.innerHTML = 'Resume';
                buttons.run.title = 'Start automatic generation movement';
            }
        }());

        //toggleRunButton();

        inputs.width.disabled = state.keepStepping;

        buttons.reset.disabled = state.keepStepping;
        buttons.step.disabled = state.keepStepping;

        if (state.keepStepping) {
            step();
        }
    }

    //End init State objs

    /**
     * Toggles display of the rules for this algorithm
     */
    function showRules() {
        if (state.isShowingRules) {
            monkeyGameRules.style.display = 'none';
            state.isShowingRules = false;
        }
        else {
            monkeyGameRules.style.display = 'block';
            state.isShowingRules = true;
        }
    }

    /**
     * Initiate the board. Setup the table cells, create the x/y index. Return an object of arrays of cells.
     */
    function createBoard() {
        var ret = {
            hot: [],
            warm: [],
            cold: []
        };

        //Purge the former board
        (function clearBoard() {
            while (monkeyGameBoard.hasChildNodes()) {
                monkeyGameBoard.removeChild(monkeyGameBoard.lastChild);
            }
        }());

        //Simple row/column iterator on 1-based index. Executes a callback inside each iteration.
        function iterate(len, onEach) {
            for (var i = 1; i <= len; i += 1) {
                if (onEach) {
                    onEach(i);
                }
            }
        }

        //Iterate from 1 to the width for each iteration of 1 to the height. Execute a callback inside each iteration.
        //The onEachRow callback must return a row. The onEachCell callback must return a cell.
        function iterateGrid(onEachRow, onEachCell) {
            return iterate(state.height, function(rowNo) {
                var row = onEachRow(rowNo);

                iterate(state.width, function(cellNo) {
                    var cell = onEachCell(row, cellNo);
                    row.appendChild(cell);
                });

                monkeyGameBoard.appendChild(row);
            });

        }

        //For visual validation of the algorithm, callback to validate any given cell in the grid.
        function validateCell(cell) {
            var validateDiv = document.getElementById('validate');
            var text = '';
            if (cell) {
                var sumofCoords = getCoordinateSum(cell.x, cell.y);

                validateDiv.style.display = 'block';
                text = 'Position (' + cell.x + ', ' + cell.y + ') is ';
                if (sumofCoords > 19) {
                    text += 'NOT ';
                }
                text += 'accessible, because the sum of its coordinates is ' + sumofCoords;
            }
            validateDiv.innerHTML = text;
        }

        //Now, actually build the grid.
        iterateGrid(function onEachRow(rowNo) {
            var row = document.createElement('tr');
            var yIndex = state.zero() - rowNo;
            row.y = yIndex;

            return row;
        }, function onEachCell(row, cellNo) {
            var cell = document.createElement('td');

            var xIndex = cellNo - state.zero();
            //Convenience handle. Doesn't affect the DOM--only our in memory instance.
            cell.y = row.y;
            cell.x = xIndex;

            //For debugging from the app. These will show up in the DOM.
            cell.dataset.x = xIndex;
            cell.dataset.y = cell.y;

            //(0,0) is hot, we know we have it, so let's mark it up
            if (cell.y === 0 && cell.x === 0) {
                cell.className = 'cell hot';
                cell.innerHTML = '0';
                ret.hot.push(cell); //We can touch this coord.
            }
            else {
                ret.cold[cell.x] = ret.cold[cell.x] || [];
                ret.cold[cell.x][cell.y] = cell; //We don't know if we can touch this coord. Let's not try to figure it out now, just cache it for later.

                if (cell.y === 0) {
                    cell.className = 'cell zero';
                    cell.innerHTML = cell.x;
                }
                else if (cell.x === 0) {
                    cell.className = 'cell zero';
                    cell.innerHTML = cell.y;
                }
                else {
                    cell.className = 'cell dud';
                    cell.innerHTML = '&nbsp;';
                }
            }

            cell.onmouseenter = function() {
                return validateCell(cell);
            };
            cell.onmouseleave = function() {
                return validateCell();
            };
            return cell;
        });

        return ret;
    }

    function stepOnce() {
        state.keepStepping = false;
        step();
    }

    function step() {

        //For a given set of coords, fetch a cell out of the cold stack and either nuke it or make it hot.
        function handleCoords(x, y) {
            var canMove = getCoordinateSum(x, y) <= 19;

            var cell = null;
            if (state.cellCollections.cold[x]) {
                cell = state.cellCollections.cold[x][y]; //Get a reference on the cell at these coord
                state.cellCollections.cold[x][y] = null; //Nuke it immediately from the collection so subsequent callers cannot touch it; but don't mutate the indexes!
            }
            if (canMove && cell) {
                cell.state = 'hot';
                cell.className = 'cell hot';
                state.cellCollections.hot.push(cell);
            }
        }

        //Start shuffling the current hot stack into the warm stack. Process the warm.
        if (state.cellCollections.hot.length > 0) {
            state.stepCount += 1;
            //All current hot cells are now just warm
            var currentHot = state.cellCollections.hot.splice(0, state.cellCollections.hot.length);
            currentHot.forEach(function(hotCell) {
                hotCell.state = 'warm';
                hotCell.className = 'cell warm';
                state.cellCollections.warm.push(hotCell);

                //All eligible cells will become hot for the next iteration, else they will be nuked from the cold stack.
                handleCoords(hotCell.y + 1, hotCell.x);
                handleCoords(hotCell.y - 1, hotCell.x);
                handleCoords(hotCell.y, hotCell.x + 1);
                handleCoords(hotCell.y, hotCell.x - 1);
            });

            updateAnswerText();

            if (state.keepStepping) {
                setTimeout(step, 100);
            }
        }
        else {
            toggleRunningState();
            //All hot cells have been processed; disable the run/step buttons.
            buttons.run.disabled = true;
            buttons.step.disabled = true;
        }
    }



}());