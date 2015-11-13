var utError = require('ut-error');

var errorTypes = {
	errorType1 : utError.define('ErrorType1'),
	errorType2 : utError.define('ErrorType2', 'ErrorType1'),
	errorType3 : utError.define('ErrorType3', 'ErrorType2')
}

var errorInstances = {
    errorType1 : {
        noArgs                  : errorTypes.errorType1(),
        stringArg               : errorTypes.errorType1('errorType1 custom stringArg message'),
        objectArg               : errorTypes.errorType1({code: 1, message: 'errorType1 custom objectArg message'}),
        objectArgInterpolation  : errorTypes.errorType1({message: 'errorType1 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg          : errorTypes.errorType1(new Error('errorType1 real exception'))
    },
    errorType2 : {
        noArgs                  : errorTypes.errorType2(),
        stringArg               : errorTypes.errorType2('errorType2 custom stringArg message'),
        objectArg               : errorTypes.errorType2({code: 1, message: 'errorType2 custom objectArg message'}),
        objectArgInterpolation  : errorTypes.errorType2({message: 'errorType2 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg          : errorTypes.errorType2(new Error('errorType2 real exception'))
    },
    errorType3 : {
        noArgs                  : errorTypes.errorType3(),
        stringArg               : errorTypes.errorType3('errorType3 custom stringArg message'),
        objectArg               : errorTypes.errorType3({code: 1, message: 'errorType3 custom objectArg message'}),
        objectArgInterpolation  : errorTypes.errorType3({message: 'errorType3 custom {test} objectArg message', params: {test: 'interpolated'}}),
        jsExceptionArg          : errorTypes.errorType3(new Error('errorType3 real exception'))
    }
}

// inspect properties
for (var errorType in errorInstances) {
    if (errorInstances.hasOwnProperty(errorType)) {
        for (var err in errorInstances[errorType]) {
            if (errorInstances[errorType].hasOwnProperty(err)) {
                console.log('\nError Type: ', errorType);
                console.log('Instance Name: ', err);
                console.log('Error Message: ', errorInstances[errorType][err].message);
                var props = {};
                for (var prop in errorInstances[errorType][err]) {
                    if (errorInstances[errorType][err].hasOwnProperty(prop)) {
                        props[prop] = errorInstances[errorType][err][prop];
                    }
                }
                console.log('Error Properties: ', JSON.stringify(props, null, 4), '\n');
                console.log('Error stack: ', errorInstances[errorType][err].stack);
                console.log('\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n');
            }
        }
    }
}

console.log('\n\nSuccessfull Inheritance Tests \n\n');

for(var errorType in errorInstances) {
    if (errorInstances.hasOwnProperty(errorType)) {
        for (var err in errorInstances[errorType]) {
            if (errorInstances[errorType].hasOwnProperty(err)) {
                console.log(
                    (errorInstances[errorType][err] instanceof Error) +
                    ' <- '+
                    'errorInstances.' + errorType + '.' + err + ' instaneof Error'
                );
                for (var errType in errorTypes) {
                	if (errorTypes.hasOwnProperty(errType)) {
                		if(parseInt(errorType.slice(-1)) >= parseInt(errType.slice(-1))) {
                			console.log(
				                (errorInstances[errorType][err] instanceof errorTypes[errType]) +
				                ' <- '+
				                'errorInstances.' + errorType + '.' + err + ' instaneof errorTypes.' + errType
				            );
                		}
                	}
                }
            }
        }
    }
}


console.log('\n\nUnsuccessfull Inheritance Tests \n\n');

for(var errorType in errorInstances) {
    if (errorInstances.hasOwnProperty(errorType)) {
        for (var err in errorInstances[errorType]) {
            if (errorInstances[errorType].hasOwnProperty(err)) {
                for (var errType in errorTypes) {
                	if (errorTypes.hasOwnProperty(errType)) {
                		if(parseInt(errorType.slice(-1)) < parseInt(errType.slice(-1))) {
                			console.log(
				                (errorInstances[errorType][err] instanceof errorTypes[errType]) +
				                ' <- '+
				                'errorInstances.' + errorType + '.' + err + ' instaneof errorTypes.' + errType
				            );
                		}
                	}
                }
            }
        }
    }
}
