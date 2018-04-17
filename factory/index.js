var nameRegex = /^[a-z][a-zA-Z]*$/;
var initialized = false;
var log;

function deprecationWarning(msg, context) {
    var e = new Error();
    log && log.warn && log.warn(msg, {mtid: 'DEPRECATION', context, stack: e.stack.split('\n').splice(3).join('\n')});
}

function createErrorConstructor(type, SuperCtor, message, level) {
    class CustomUTError extends SuperCtor {
        constructor(x) {
            if (typeof x !== 'object') {
                deprecationWarning('argument must be an object', {argument: x, type});
                x = {message: x}; // temporary polyfill
            }
            super(x);
            this.type = type;
            if (level && !this.level) this.level = level;
        }
        get defaultMessage() {
            return message;
        }
        static get type() {
            return type;
        }
        static get level() {
            return level;
        }

    }
    return function customError(x) {
        return new CustomUTError(x);
    };
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
            deprecationWarning('error identifier must be a string', {id});
        } else if (!nameRegex.test(id)) {
            deprecationWarning('error identifier must be alphabetic and start with lowercase', {id});
        }
        if (typeof level === 'object') {
            deprecationWarning('level must be string', {id});
            level = level.level;
        }
        var SuperCtor = UTError;
        if (superType) {
            if (typeof message !== 'string') {
                deprecationWarning('missing error message', {id});
            }
            if (typeof superType === 'string' && errorTypes[superType]) {
                SuperCtor = errorTypes[superType];
            } else if (typeof superType === 'function' && superType.prototype instanceof UTError) {
                SuperCtor = superType;
            }
        }
        var type = SuperCtor === UTError ? id : SuperCtor.type + '.' + id;
        if (errorTypes[type]) {
            throw errorTypes.typeExists({params: {id, type}});
        }
        errorTypes[type] = createErrorConstructor(type, SuperCtor, message, level);
        return errorTypes[type];
    },
    get: function(type) {
        if (!type) {
            return errorTypes;
        }
        return errorTypes[type] || errorTypes.unknownType.bind(null, {params: {type}});
    }
};

module.exports = (bus) => {

};
