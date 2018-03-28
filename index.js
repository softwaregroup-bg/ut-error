var isProto = Symbol.for('isProto');
var interpolationRegex = /\{([^}]*)\}/g;
var nameRegex = /^[a-z][a-zA-Z]*$/;
var errorTypes = {};
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
    this.message = interpolate(defaultMessage || x.message || 'Unknown Error', x.params || {});
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
        this.defaultMessage = message;
        if (level) this.level = level;
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
        return errorTypes[type] || (errorTypes[type] = createErrorConstructor(type, SuperCtor, message, level));
    },
    get: function(type) {
        return type ? errorTypes[type] : errorTypes;
    }
};
