# UT Error

ut-error is a module that should be used for generating errors everywhere within the ut-bus framework and all implementations based upon it. This is a module that offers functionalities for better error handling in the background and gives possibilities for dynamic error classes declaration and hierarchical chaining.

ut-error should be used mainly through its 'define' method. For example:

```js
var utError = require('ut-error');

var ErrorType1 = utError.define('ErrorType1');

var ErrorType2 = utError.define('ErrorType2', errorType1);

var ErrorType3 = utError.define('ErrorType3', errorType2);

```

The define method will create a new error type or will just return it if it was previously defined. It will also build the hierarchy between the error classes automatically.
After defining the error types, the errors themselves can be instantiated as follows:

```js
var e1 = ErrorType1('e1 message');
// same as:
//var e1 = new ErrorType1('e1 message');
var e2 = ErrorType1('e2 message');
var e3 = ErrorType1('e3 message');
```

The errors are actually real 'Error' objects but additionally the following inheritance is achieved:

```js
console.log(e1 instnaceof Error) // -> true
console.log(e1 instnaceof ErrorType1) // -> true

console.log(e2 instnaceof Error) // -> true
console.log(e2 instnaceof ErrorType1) // -> true
console.log(e2 instnaceof ErrorType2) // -> true

console.log(e3 instnaceof Error) // -> true
console.log(e3 instnaceof ErrorType1) // -> true
console.log(e3 instnaceof ErrorType2) // -> true
console.log(e3 instnaceof ErrorType3) // -> true
```

And the 'type' properties of the error instances themselves are as follows.

```js
console.log(e1.type) // -> 'ErrorType1'
console.log(e2.type) // -> 'ErrorType1.ErrorType2'
console.log(e3.type) // -> 'ErrorType1.ErrorType2.ErrorType3'
```

The 'define' method accepts 2 arguments: `name` and `superType`, where:

- `name` (required) is a string, specifying the name of the error class ()
- `superType` (optional - if inheritance is desired) is a function (i.e an already defined errorType class) or a string, representing the type of an already defined errorType class.

superType can accept either a function or a string, which means that:

```js
var utError = require('ut-error');

var ErrorType1 = utError.define('ErrorType1');

var ErrorType2 = utError.define('ErrorType2', errorType1);
/* is the same as:
var ErrorType2 = utError.define('ErrorType2', 'ErrorType1');
*/

var ErrorType3 = utError.define('ErrorType3', errorType2);
/* is the same as:
var ErrorType3 = utError.define('ErrorType3', 'ErrorType1.ErrorType2');
*/
```

The error constructors that get generated accept only 1 argument but that argument is actually very flexible: it can be undefined, string, object or even a real javascript exception.

So errors can be generated either way:

```js
var generateError = require('ut-error').define('ErrorType');

var e1 = generateError();
var e2 = generateError('error message');
var e3 - generateError({code: 1, message: 'error message'});
var e4 - generateError(new Error('error message'));
/* i.e.
try {
 somethingWrong();
} catch (e) {
  throw generateError(e);
}
*/
```

## Recommended pattern for defining errors

Create a file errors.js in your module, having contents following this pattern:

```js
'use strict';
const create = require('ut-error').define;
const Category1 = create('category1');
const Category2 = create('category2');

module.exports = {
    category1: Category1,
    errorA: create('errorA', Category1, 'Default error message 1'),
    errorB: create('errorB', Category1, 'Default error message 2'),
    errorC: create('errorC', Category1, 'Default error message 3'),
    category2: Category2,
    errorD: create('errorD', Category2, 'Default error message 4'),
    errorE: create('errorE', Category2, 'Default error message 5'),
    errorF: create('errorF', Category2, 'Error in {parameterName}')
};
```

Use the errors, following these patterns:

```js
var errors = require('./errors');

function f1(){
    throw errors.errorA();
}

function f2(){
    throw errors.errorF({params: {parameterName: 'f2'}});
}

function f3(){
    throw errors.errorF({params: {parameterName: 'f3'}});
}

function f4(){
    try {
        doSomething();
    } catch (e) {
        throw errors.errorB(e);
    }
}

function f5(){
    throw errors.errorB('Custom error message');
}

function f6(){
    return Promise.reject(errors.errorC());
}

```
 
