var utError = require('ut-error');

var errorType1 = utError.define('ErrorType1');
var errorType2 = utError.define('ErrorType2', 'ErrorType1');
var errorType3 = utError.define('ErrorType3', 'ErrorType2');

var testErrors = {
    errorType1 : {
        noArgs                  : errorType1.generate(),
        stringArg               : errorType1.generate('errorType1 custom stringArg message'),
        objectArg               : errorType1.generate({code: 1, message: 'errorType1 custom objectArg message'}),
        objectArgInterpolation  : errorType1.generate({message: 'errorType1 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg          : errorType1.generate(new Error('errorType1 real exception'))
    },
    errorType2 : {
        noArgs                  : errorType2.generate(),
        stringArg               : errorType2.generate('errorType2 custom stringArg message'),
        objectArg               : errorType2.generate({code: 1, message: 'errorType2 custom objectArg message'}),
        objectArgInterpolation  : errorType2.generate({message: 'errorType2 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg          : errorType2.generate(new Error('errorType2 real exception'))
    },
    errorType3 : {
        noArgs                  : errorType3.generate(),
        stringArg               : errorType3.generate('errorType3 custom stringArg message'),
        objectArg               : errorType3.generate({code: 1, message: 'errorType3 custom objectArg message'}),
        objectArgInterpolation  : errorType3.generate({message: 'errorType3 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg          : errorType3.generate(new Error('errorType3 real exception'))
    }
}

// inspect properties
for (var errorType in testErrors) {
    if (testErrors.hasOwnProperty(errorType)) {
        for (var err in testErrors[errorType]) {
            if (testErrors[errorType].hasOwnProperty(err)) {
                console.log('\nError Type: ', errorType);
                console.log('Instance Name: ', err);
                console.log('Error Message: ', testErrors[errorType][err].message);
                var props = {};
                for (var prop in testErrors[errorType][err]) {
                    if (testErrors[errorType][err].hasOwnProperty(prop)) {
                        props[prop] = testErrors[errorType][err][prop];
                    }
                }
                console.log('Error Properties: ', JSON.stringify(props, null, 4), '\n');
                console.log('stack: ', testErrors[errorType][err].stack);
                console.log('\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n');
            }
        }
    }
}

console.log('\n\nInheritance Tests \n\n')

console.log(
    'testErrors.errorType1.objectArg instanceof Error',
    '      : ',
    testErrors.errorType1.objectArg instanceof Error
);

console.log(
    'testErrors.errorType1.objectArg instanceof ErrorType1',
    ' : ',
    testErrors.errorType1.objectArg instanceof errorType1.getConstructor()
);

console.log(
    'testErrors.errorType2.objectArg instanceof Error',
    '      : ',
    testErrors.errorType2.objectArg instanceof Error
);

console.log(
    'testErrors.errorType2.objectArg instanceof ErrorType1',
    ' : ',
    testErrors.errorType2.objectArg instanceof errorType1.getConstructor()
);

console.log(
    'testErrors.errorType2.objectArg instanceof ErrorType2',
    ' : ',
    testErrors.errorType2.objectArg instanceof errorType2.getConstructor()
);

console.log(
    'testErrors.errorType3.objectArg instanceof Error',
    '      : ',
    testErrors.errorType3.objectArg instanceof Error
);

console.log(
    'testErrors.errorType3.objectArg instanceof ErrorType1',
    ' : ',
    testErrors.errorType3.objectArg instanceof errorType1.getConstructor()
);

console.log(
    'testErrors.errorType3.objectArg instanceof ErrorType2',
    ' : ',
    testErrors.errorType3.objectArg instanceof errorType2.getConstructor()
);

console.log(
    'testErrors.errorType3.objectArg instanceof ErrorType3',
    ' : ',
    testErrors.errorType3.objectArg instanceof errorType3.getConstructor()
);

console.log('--------------');

console.log(
    'testErrors.errorType1.objectArg instanceof ErrorType2',
    ' : ',
    testErrors.errorType1.objectArg instanceof errorType2.getConstructor()
);

console.log(
    'testErrors.errorType2.objectArg instanceof ErrorType3',
    ' : ',
    testErrors.errorType2.objectArg instanceof errorType3.getConstructor()
);

console.log(
    'testErrors.errorType1.objectArg instanceof ErrorType3',
    ' : ',
    testErrors.errorType1.objectArg instanceof errorType3.getConstructor()
);
