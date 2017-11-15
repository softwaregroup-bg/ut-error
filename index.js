var isProto = Math.random();

function inherit(Ctor, SuperCtor) {
    Ctor.prototype = (SuperCtor === Error) ? new Error() : new SuperCtor(isProto); // hinting that a prototype object but not a regular instance is being constructed
    Ctor.superConstructor = SuperCtor;
    Ctor.prototype.constructor = Ctor;
}

function UTError(x) {
    if (x === isProto) { // knowing that a prototype object but not a regular instance is being constructed
        return;
    }
    Error.call(this);
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    if (typeof x === 'string') {
        this.message = x;
    } else if (typeof x === 'object') {
        if (x instanceof Error) {
            this.code = x.code;
            this.message = x.message;
            this.cause = x;
        } else {
            Object.keys(x).forEach(function(prop) {
                this[prop] = x[prop];
            }.bind(this));
        }
    }
    if (!this.code) {
        // unknown error in iso8583
        this.code = 96;
    }
    if (!this.message) { // this is in case x is undefined or an object with a missing 'message' property
        this.message = 'Unknown Error';
    } else {
        this.message && (this.message = this.interpolate(this.message));
    }
}

inherit(UTError, Error);

var interpolationRegex = /\{([^}]*)\}/g;

UTError.prototype.interpolate = function(message) {
    if (message) {
        this.print = message;
    }
    if (this.params) {
        this.print = this.print.replace(interpolationRegex, (placeHolder, label) => (this.params[label]));
    }
    return this.print;
};

function createErrorConstructor(type, name, SuperCtor, defaultMessage, code) {
    function CustomUTError(x) {
        if (x === isProto) { // knowing that a prototype object but not a regular instance is being constructed
            return;
        } else if (!(this instanceof CustomUTError)) {
            return new CustomUTError(x);
        }
        SuperCtor.call(this, x);
        this.type = type;
        this.code = code || this.code;
        if (defaultMessage) {
            this.message = this.interpolate(defaultMessage);
        }
    }
    inherit(CustomUTError, SuperCtor);

    CustomUTError.prototype.name = type;

    return CustomUTError;
}

var errorTypes = {};
var errors = {};

module.exports = {
    init: function(bus) {

    },
    define: function(name, superType, defaultMessage, errorObject, code) {
        var SuperCtor = UTError;
        if (errorObject && (typeof errorObject.name === 'string') && !errors[errorObject.name]) {
            errors[errorObject.name] = errorObject;
        };
        if (superType) {
            if ((typeof superType === 'string') && errorTypes[superType]) {
                SuperCtor = errorTypes[superType];
            } else if ((typeof superType === 'function') && (superType.prototype instanceof UTError)) {
                SuperCtor = superType;
            }
        }
        var type = SuperCtor === UTError ? name : SuperCtor.prototype.name + '.' + name;
        return errorTypes[type] || (errorTypes[type] = createErrorConstructor(type, name, SuperCtor, defaultMessage, code));
    },
    get: function(type) {
        return type ? errorTypes[type] : errorTypes;
    },
    errors: errors
};
