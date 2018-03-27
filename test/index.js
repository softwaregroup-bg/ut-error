/* eslint no-console:0 */
var util = require('util');
var utError = require('../index');

var errorType1 = utError.define('errorType1');
var errorType2 = utError.define('errorType2', errorType1, 'errorType2 error message: {x} {y}');
var errorType3 = utError.define('errorType3', errorType2, 'errorType3 error message: {x} {y}');

var errorTypes = {
    errorType1,
    errorType2,
    errorType3
};

var jsError = new Error('root error');

var errorInstances = {
    errorType1: {
        objectArg: errorType1({x: 1, y: 2}),
        objectArgInterpolation: errorType1({params: {x: 1, y: 2}}),
        jsExceptionArg: errorType1(jsError),
        jsExceptionArgWithParams: errorType1(Object.assign(new Error('error with params {x} {y}'), {params: {x: 'A', y: 'B'}}))
    },
    errorType2: {
        objectArg: errorType2({x: 1, y: 2}),
        objectArgInterpolation: errorType2({params: {x: 1}}),
        jsExceptionArg: errorType2(jsError)
    },
    errorType3: {
        objectArg: errorType3({x: 1, y: 2}),
        objectArgInterpolation: errorType3({params: {x: 1, y: 2}}),
        jsExceptionArg: errorType3(jsError)
    }
};

var errorType;
var err;
var errType;

console.log('\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n\nProperties Inspection\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n\n');
for (errorType in errorInstances) {
    if (errorInstances.hasOwnProperty(errorType)) {
        for (err in errorInstances[errorType]) {
            if (errorInstances[errorType].hasOwnProperty(err)) {
                console.log('\n--------------------------------------------------\n');
                console.log('errorInstances.' + errorType + '.' + err);
                console.log('\n--------------------------------------------------\n');
                var props = {};
                for (var prop in errorInstances[errorType][err]) {
                    if (errorInstances[errorType][err].hasOwnProperty(prop)) {
                        props[prop] = errorInstances[errorType][err][prop];
                    }
                }
                console.log('\nProperties:\n\n' + util.inspect(props, {depth: null, colors: true}), '\n');
                console.log('\nStack:\n\n' + errorInstances[errorType][err].stack);
            }
        }
    }
}

console.log('\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n\nTruthful Inheritance Tests\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n\n');

for (errorType in errorInstances) {
    if (errorInstances.hasOwnProperty(errorType)) {
        for (err in errorInstances[errorType]) {
            if (errorInstances[errorType].hasOwnProperty(err)) {
                console.log(
                    (errorInstances[errorType][err] instanceof Error) +
                    ' <- ' +
                    'errorInstances.' + errorType + '.' + err + ' instanceof Error'
                );
                for (errType in errorTypes) {
                    if (errorTypes.hasOwnProperty(errType)) {
                        if (parseInt(errorType.slice(-1), 10) >= parseInt(errType.slice(-1), 10)) {
                            console.log(
                                (errorInstances[errorType][err] instanceof errorTypes[errType]) +
                                ' <- ' +
                                'errorInstances.' + errorType + '.' + err + ' instanceof errorTypes.' + errType
                            );
                        }
                    }
                }
            }
        }
    }
}

console.log('\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n\nUntruthful Inheritance Tests\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n\n');

for (errorType in errorInstances) {
    if (errorInstances.hasOwnProperty(errorType)) {
        for (err in errorInstances[errorType]) {
            if (errorInstances[errorType].hasOwnProperty(err)) {
                for (errType in errorTypes) {
                    if (errorTypes.hasOwnProperty(errType)) {
                        if (parseInt(errorType.slice(-1), 10) < parseInt(errType.slice(-1), 10)) {
                            console.log(
                                (errorInstances[errorType][err] instanceof errorTypes[errType]) +
                                ' <- ' +
                                'errorInstances.' + errorType + '.' + err + ' instanceof errorTypes.' + errType
                            );
                        }
                    }
                }
            }
        }
    }
}
