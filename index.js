var isProto = Math.random();

function inherit(Ctor, SuperCtor) {
    Ctor.prototype = new SuperCtor(isProto); //hinting that a prototype object but not a regular instance is being constructed
    Ctor.superConstructor = SuperCtor;
    Ctor.prototype.constructor = Ctor;
}

function UTError(x) {
    if (x === isProto) { //knowing that a prototype object but not a regular instance is being constructed
        return;
    }
    Error.call(this);
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    var prop;
    var props = {
        message : 'Unknown Error'
    };
    if (typeof x === 'string') {
        props.message = x;
    } else if (typeof x === 'object') {
        if (x instanceof Error) {
            props.message = x.message;
            props.cause   = x;
        } else {
            for (prop in x) {
                if (x.hasOwnProperty(prop)) {
                    props[prop] = x[prop];
                }
            }
        }
    }
    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            this[prop] = props[prop];
        }
    }
    this.type = this.getType();
}

inherit(UTError, Error);

var interpolationRegex = /{([^{}]*)}/g;
function interpolate(message, params) {
    return message.replace(interpolationRegex,
        function(placeHolder, label) {
            return params[label] || placeHolder;
        }
    );
}

UTError.prototype.interpolate = function(message) {
    this.print = interpolate(message || this.print, this.params);
    return this.print;
};

function createErrorConstructor(type, SuperCtor) {
    function CustomUTError(x) {
        if (x === isProto) { //knowing that a prototype object but not a regular instance is being constructed
            return;
        } else if (!(this instanceof CustomUTError)) {
            return new CustomUTError(x);
        }
        SuperCtor.call(this, x);
    }
    inherit(CustomUTError, SuperCtor);

    CustomUTError.prototype.getType = function() {
        return type;
    };

    return CustomUTError;
}

var errorTypes = {};

module.exports = {
    init: function(bus) {

    },
    define: function(name, superType) {
        var SuperCtor = UTError;
        if ((typeof superType === 'string') && errorTypes[superType]) {
            SuperCtor = errorTypes[superType];
        } else if ((typeof superType === 'function') && (superType.prototype instanceof UTError)) {
            SuperCtor = superType;
        }
        var type = SuperCtor === UTError ? name : SuperCtor.prototype.getType() + '.' + name;
        return errorTypes[type] || (errorTypes[type] = createErrorConstructor(type, SuperCtor));
    },
    get: function(type) {
        return type ? errorTypes[type] : errorTypes;
    }
};
