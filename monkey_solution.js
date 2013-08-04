(function() {
   //Coord cache
   var positions = {
        hot: [{x: 0, y: 0}],
        warm: [],
        touched: {}
    };
    
    //Get the sum of the digits of any two numbers using their absolute value.
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
    
    //For a given set of coords, evaluate eligibility for movement
    function handleCoord(coord) {
        if (false === isPositionTouched(coord)) {
            touchPosition(coord);
            var canMove = getCoordinateSum(coord.x, coord.y) <= 19;
            if(canMove) {
                 positions.hot.push(coord);   
            }
        }
    }
    
    //Look to the cells up, down, left and right and handle the coords
    function lookAround(coord) {
        handleCoord({x: coord.x+1, y: coord.y });
        handleCoord({x: coord.x-1, y: coord.y });
        handleCoord({x: coord.x, y: coord.y+1 });
        handleCoord({x: coord.x, y: coord.y-1 });
    }
    
    function isPositionTouched(coord) {
        //Coord hasn't been seen if the x index hasn't been created or of the x/y postion has not been explicitly set true
        return (undefined !== positions.touched[coord.x] && true === positions.touched[coord.x][coord.y]);
    }
    
    //mark a coord touched
    function touchPosition(coord) {
        positions.touched[coord.x] = positions.touched[coord.x] || {};
        positions.touched[coord.x][coord.y] = true;
    }
    
    function handleWarm(coord) {
         positions.warm.push(coord);
         touchPosition(coord);
         lookAround(coord);
    }
    
    //Pull all the hot coords out of the stack and return them as a deref'd array
    function extractHot() {
        var ret = positions.hot.splice(0, positions.hot.length);
        return ret;
    }

    function evaluateHot() {
        var hot = extractHot();
        hot.forEach(handleWarm);
    }
    
    function getMonkeyMoveCount() {
        while(positions.hot.length > 0) {
            evaluateHot();
        }
        return positions.hot.length + positions.warm.length;
    }
    
    var solution = getMonkeyMoveCount();
    if(window) {
        window.monkeyMath = window.monkeyMath || Object.create(null);
        window.monkeyMath.solution = solution;
    }
    
    console.log('Monkey movement solution:');
    console.log(solution);
}());