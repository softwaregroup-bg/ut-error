const isProto = Symbol.for('isProto');
const interpolationRegex = /\{([^}]*)\}/g;
const stringFormatValidator = regex => str => regex.test(str);
const isCamelCase = stringFormatValidator(/^[a-z][a-zA-Z0-9]*$/);
const isAlphaNumeric = stringFormatValidator(/^[a-zA-Z0-9]+$/);
var initialized = false;
var log;

function deprecationWarning(msg, context) {
    var e = new Error();
    log && log.warn && log.warn(msg, {mtid: 'DEPRECATION', context, stack: e.stack.split('\n').splice(3).join('\n')});
}

function inherit(Ctor, SuperCtor) {
    Ctor.prototype = (SuperCtor === Error) ? new Error() : new SuperCtor(isProto); // hinting that a prototype object but not a regular instance is being constructed
    Ctor.superConstructor = SuperCtor;
    Ctor.prototype.constructor = Ctor;
}

function interpolate(message, params) {
    return message.replace(interpolationRegex, (placeHolder, label) => {
        return typeof params[label] === 'undefined' ? `?${label}?` : params[label];
    });
};

function UTError(x) {
    if (x === isProto) { // knowing that a prototype object but not a regular instance is being constructed
        return;
    }
    Error.call(this);
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    var defaultMessage = this.defaultMessage;
    if (x instanceof Error) {
        this.cause = x;
    } else {
        Object.assign(this, x);
    }
    this.message = interpolate(x.message || defaultMessage || 'Unknown Error', x.params || {});
}

inherit(UTError, Error);

function createErrorConstructor(type, SuperCtor, message, level) {
    function CustomUTError(x) {
        if (x === isProto) { // knowing that a prototype object but not a regular instance is being constructed
            return;
        } else if (!(this instanceof CustomUTError)) {
            return new CustomUTError(x);
        } else if (typeof x !== 'object') {
            deprecationWarning('argument must be an object', {argument: x, type});
            x = {message: x}; // temporary polyfill
        }
        SuperCtor.call(this, x);
        this.type = type;
        if (level && !this.level) this.level = level;
    }
    inherit(CustomUTError, SuperCtor);
    CustomUTError.type = type;
    CustomUTError.level = level;
    CustomUTError.prototype.defaultMessage = message;
    return CustomUTError;
}

var errorTypes = {
    typeExists: createErrorConstructor('typeExists', UTError, 'Error {id} is already defined! Type: {type}', 'error'),
    unknownType: createErrorConstructor('unknownType', UTError, 'Unknown error type: {type}', 'error')
};
module.exports = {
    init: function(bus) {
        if (initialized) {
            return;
        }
        initialized = true;
        if (bus && bus.logFactory) {
            log = bus.logFactory.createLog(bus.logLevel, {name: 'utError', context: 'utError'});
        }
    },
    define: function(id, superType, message, level) {
        if (typeof id !== 'string') {
            throw new Error(JSON.stringify({
                message: 'wrong id type',
                expected: 'string',
                actual: typeof id
            }, null, 4));
        }
        if (typeof level === 'object') {
            deprecationWarning('level must be string', {id});
            level = level.level;
        }
        var SuperCtor = UTError;
        if (superType) {
            if (!isAlphaNumeric(id)) {
                deprecationWarning('error identifier must comprise alphanumeric characters only', {id});
            }
            if (typeof message !== 'string') {
                deprecationWarning('missing error message', {id});
            }
            if (typeof superType === 'string' && errorTypes[superType]) {
                SuperCtor = errorTypes[superType];
            } else if (typeof superType === 'function' && superType.prototype instanceof UTError) {
                SuperCtor = superType;
            }
        } else if (!isCamelCase(id)) {
            deprecationWarning('error identifier must be in camelCase format', {id});
        }
        var type = SuperCtor === UTError ? id : SuperCtor.type + '.' + id;
        if (errorTypes[type]) {
            let error = errorTypes.typeExists({params: {id, type}});
            deprecationWarning(error.message);
            // throw error;
        }
        errorTypes[type] = createErrorConstructor(type, SuperCtor, message, level);
        return errorTypes[type];
    },
    fetch: function(RootError) {
        if (!RootError) {
            RootError = UTError;
        } else {
            if (typeof RootError === 'string') {
                RootError = errorTypes[RootError];
            }
            if (!RootError || !(RootError.prototype instanceof UTError)) {
                return {}; // maybe throw
            }
        }
        let errors = {};
        errors[RootError.type] = RootError;
        Object.keys(errorTypes).forEach(type => {
            if (errorTypes[type].prototype instanceof RootError) {
                errors[type] = errorTypes[type];
            }
        });
        return errors;
    },
    get: function(type) {
        if (!type) { // TODO: remove check. use fetch for fetching multiple error definitions
            return errorTypes;
        }
        return errorTypes[type];
        // TODO: should we return unknownType error or leave it undefined?
        // return errorTypes[type] || errorTypes.unknownType.bind(null, {params: {type}});
    }
};
