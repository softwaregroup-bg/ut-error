var utError = require('ut-error');

var errorType1 = utError.define('ErrorType1');
var errorType2 = utError.define('ErrorType2', errorType1);
var errorType3 = utError.define('ErrorType3', errorType2);

var errorTypes = {
    errorType1: errorType1,
    errorType2: errorType2,
    errorType3: errorType3
};

var jsError = new Error('root error');

var errorInstances = {
    errorType1: {
        noArgs: errorTypes.errorType1(),
        stringArg: errorTypes.errorType1('errorType1 custom stringArg message'),
        objectArg: errorTypes.errorType1({code: 1, message: 'errorType1 custom objectArg message', cause:jsError}),
        objectArgInterpolation: errorTypes.errorType1({message: 'errorType1 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg: errorTypes.errorType1(jsError)
    },
    errorType2: {
        noArgs: errorTypes.errorType2(),
        stringArg: errorTypes.errorType2('errorType2 custom stringArg message'),
        objectArg: errorTypes.errorType2({code: 1, message: 'errorType2 custom objectArg message', cause:jsError}),
        objectArgInterpolation: errorTypes.errorType2({message: 'errorType2 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg: errorTypes.errorType2(jsError)
    },
    errorType3: {
        noArgs: errorTypes.errorType3(),
        stringArg: errorTypes.errorType3('errorType3 custom stringArg message'),
        objectArg: errorTypes.errorType3({code: 1, message: 'errorType3 custom objectArg message', cause:jsError}),
        objectArgInterpolation: errorTypes.errorType3({message: 'errorType3 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg: errorTypes.errorType3(jsError)
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
                console.log('\nProperties:\n\n' + JSON.stringify(props, null, 4), '\n');
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
                        if (parseInt(errorType.slice(-1)) >= parseInt(errType.slice(-1))) {
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
                        if (parseInt(errorType.slice(-1)) < parseInt(errType.slice(-1))) {
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
