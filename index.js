const isProto = Symbol.for('isProto');
const interpolationRegex = /\{([^}]*)\}/g;
const nameRegex = /^[a-z][a-zA-Z_0-9]*$/;
const errorTypes = {};
var initialized = false;
var log;

function deprecationWarning(msg, context) {
    log.warn && log.warn(`${msg}${context ? ' :::: ' + JSON.stringify(context) : ''}`, {mtid: 'WARNING'});
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
    this.message = interpolate(defaultMessage || x.message || 'Unknown Error', x.params || {});
}

inherit(UTError, Error);

function createErrorConstructor(type, SuperCtor, message) {
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
        this.defaultMessage = message;
    }
    inherit(CustomUTError, SuperCtor);
    CustomUTError.type = type;
    CustomUTError.prototype.defaultMessage = message;
    return CustomUTError;
}

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
    define: function(name, superType, message) {
        if (typeof name !== 'string') {
            deprecationWarning('name must be a string!', {name});
        } else if (!nameRegex.test(name)) {
            deprecationWarning(`name must match ${nameRegex}`, {name});
        }
        var SuperCtor = UTError;
        if (superType) {
            if (typeof message !== 'string') {
                deprecationWarning('message must be predefined!', {name});
            }
            if (typeof superType === 'string' && errorTypes[superType]) {
                SuperCtor = errorTypes[superType];
            } else if (typeof superType === 'function' && superType.prototype instanceof UTError) {
                SuperCtor = superType;
            }
        }
        var type = SuperCtor === UTError ? name : SuperCtor.type + '.' + name;
        return errorTypes[type] || (errorTypes[type] = createErrorConstructor(type, SuperCtor, message));
    },
    get: function(type) {
        return type ? errorTypes[type] : errorTypes;
    }
};
