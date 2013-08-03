(function() {
    
    /**
     * Get the sum of the digits of any two, absolute numbers.
    */
    function getCoordinateSum(x, y) {
        function sumOfDigits(aNumber) {
            var ret = null;
            var ints = (aNumber + '').split('');
            ret = ints.reduce(function (curr, prev) { return (+curr) + (+prev); });
            return ret;
        }
        
        function getAbsString(num) {
            return '' + Math.abs(num);
        }
        
        function concatNums(num1, num2) {
            return getAbsString(num1) + '' + getAbsString(num2);
        }
        
        return sumOfDigits(concatNums(x,y));
    }


    var isRunning = false;
    var isShowingRules = false;
    var lifecycle = 1;
    var moveCount;
    
    var city;
    var newcity;
    var changed;

    var bePatient = document.getElementById('patience');
    var theBoard = document.getElementById('board');

    var inputs = Object.create(null, {
        height: { value: document.getElementById('textfield_height') },
        width: { value: document.getElementById('textfield_width') }
    });
    inputs.height.disabled = true;
    inputs.width.onchange = function() {
        var val = inputs.width.value;
        gridDimensions.height = val; 
        gridDimensions.width = val; 
    };
    
    var gridDimensions = Object.create(null, {
       height: {
            get: function() { 
               return inputs.height.value;
            }, 
            set: function(val) {
                if(1 !== val % 2) {
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
                if(1 !== val % 2) {
                    val = (+val) + 1;
                }
                inputs.width.value = val;
            }
       },
       zero: { value: function() { return Math.round( gridDimensions.height / 2 ); } }
    });

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

    function resetState() {
        isRunning = false;
        moveCount = 0;
        createModel();
        createBoard();
        buttons.run.innerHTML = 'Run';
        buttons.run.title = 'Start the algorithm';
    }
    resetState();

    function showRules() {
        var rules = document.getElementById('container_rules');
        if (isShowingRules) {
            rules.style.display = 'none';
            isShowingRules = false;
        }
        else {
            rules.style.display = 'block';
            isShowingRules = true;
        }
    }

    function createModel() {
        /*city = new Array(gridDimensions.width);
        newcity = new Array(gridDimensions.width);
        changed = new Array(gridDimensions.width);
        for (var x = 0; x < gridDimensions.width; x++) {
            city[x] = new Array(gridDimensions.height);
            newcity[x] = new Array(gridDimensions.height);
            changed[x] = new Array(gridDimensions.height);
            for (var y = 0; y < gridDimensions.height; y++) {
                city[x][y] = false;
                newcity[x][y] = false;
                changed[x][y] = false;
            }
        }*/
    }

    function createBoard() {
        
        theBoard.style.display = 'none';
        bePatient.style.display = 'block';
        bePatient.innerHTML = 'The board is rendering. This will take a few moments. Please be patient.';
        console.time('Board rendering.');
        
        (function clearBoard() {
            //delete all rows
            var arena = document.getElementById('playarea');
            while (arena.hasChildNodes()) {
                arena.removeChild(arena.lastChild);
            }
        }());
        
        function iterate(len, onEach) {
            for (var i= 1; i <= len; i += 1) {
                if(onEach) {
                    onEach(i);
                }
            }
        }
    
        function iterateGrid(onEachRow, onEachCell) {
            return iterate(gridDimensions.height, function(rowNo) {
                var row = onEachRow(rowNo);
               
                iterate(gridDimensions.width, function(cellNo) {
                    var cell = onEachCell(row, cellNo);
                    row.appendChild(cell);
                });
                
                arena.appendChild(row);
                if(rowNo === +gridDimensions.height) {
                    finished = true;
                }
            });
           
        }
        var finished = false;
        var arena = document.getElementById('playarea');
        iterateGrid(function onEachRow(rowNo) {
            var row = document.createElement('tr');
            var yIndex = rowNo - gridDimensions.zero();
            row.y = yIndex;
            
            return row;
        }, function onEachCell(row, cellNo) {
            var cell = document.createElement('td');
           
            cell.y = row.y;
            
            var xIndex = gridDimensions.zero() - cellNo;
            cell.dataset.x = xIndex;
            cell.dataset.y = cell.y;
            cell.x = xIndex;
            
            if(cell.y === 0 && cell.x === 0) {
                cell.className = 'cell hot';
                cell.innerHTML = '0';
            }
            else if(cell.y === 0) {
                cell.className = 'cell zero';
                cell.innerHTML = cell.x;
            }
            else if(cell.x === 0) {
                cell.className = 'cell zero';
                cell.innerHTML = cell.y;
            } else {
                cell.className = 'cell dud';
                cell.innerHTML = '&nbsp;';
            }
            
            
            cell.alive = false;
            cell.onmouseenter = function() { return validateCell(cell); };
            cell.onmouseleave = function() { return validateCell(); };
            return cell;
        });
        
        setTimeout(function wait() {
            if(finished) {
                theBoard.style.display = 'inline';
                bePatient.style.display = 'none';
                bePatient.innerHTML = '';
                console.timeEnd('Board rendering.');
            } else {
                bePatient.innerHTML += '.';
                setTimeout(wait, 100);
            }
        }, 100);
        
        moveCount = 0;
    }

    function validateCell(cell) {
        var validateDiv = document.getElementById('validate');
        var text = '';
        if(cell) {
            var sumofCoords = getCoordinateSum(cell.x, cell.y);
            
            validateDiv.style.display = 'block';
            text = 'Position (' + cell.x + ', ' + cell.y + ') is ';
            if(sumofCoords > 19) {
                text += 'NOT ';
            }
            text += 'accessible, because the sum of its coords is ' + sumofCoords;
        }
        validateDiv.innerHTML = text;
    }

     function toggleRunningState() {
        isRunning = !(isRunning);
        (function toggleRunButton() {
            if (isRunning) {
                buttons.run.innerHTML = 'Stop';
                buttons.run.title = 'Stop the algorithm';
            }
            else {
                buttons.run.innerHTML = 'Resume';
                buttons.run.title = 'Start automatic generation movement';
            }
        }());
        
        //toggleRunButton();
        
        inputs.height.disabled = isRunning;
        inputs.width.disabled = isRunning;
        
        buttons.reset.disabled = isRunning;
        buttons.step.disabled = isRunning;
        
        if (isRunning) {
            step();
        }
    }

    function stepOnce() {
        isRunning = false;
        step();
    }

    

    function step() {
        moveCount += 1;
        
        
        (function printStatus() {
            var generation = document.getElementById('generation');
            generation.innerHTML = moveCount;
        }());
        //printStatus();
        
        if (isRunning) {
            setTimeout(step, 100 * lifecycle);
        }
    }

    

}());