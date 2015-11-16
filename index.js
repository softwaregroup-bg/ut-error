var isProto = Math.random();

function inherit(ctor, SuperCtor) {
    ctor.prototype = new SuperCtor(isProto); //hinting that a prototype object but not a regular instance is being constructed
    ctor.superConstructor = SuperCtor;
    ctor.prototype.constructor = ctor;
}

function UTError(x) {
    if (x === isProto) { //knowing that a prototype object but not a regular instance is being constructed
        return;
    }
    Error.call(this);
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    var prop;
    var type = this.getType();
    var props = {
        message : type + ' Error',
        cause   : type + ' Error'
    };
    if (typeof x === 'string') {
        props.message = x;
        props.cause   = x;
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
    props.type = type;
    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            this[prop] = props[prop];
        }
    }
}

inherit(UTError, Error);

UTError.prototype.getType = function() {
    return this.constructor.name;
};

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

function createErrorConstructor(type, superCtor) {
    function CustomUTError(x) {
        if (x === isProto) { //knowing that a prototype object but not a regular instance is being constructed
            return;
        } else if (!(this instanceof CustomUTError)) {
            return new CustomUTError(x);
        }
        superCtor.call(this, x);
    }
    inherit(CustomUTError, superCtor);

    CustomUTError.prototype.getType = function() {
        return type;
    };

    return CustomUTError;
}

var errorConstructors = {};

module.exports = {
    init: function(bus) {

    },
    define: function(type, superType) {
        if (!errorConstructors[type]) {
            var superConstructor = UTError;
            if ((typeof superType === 'string') && errorConstructors[superType]) {
                superConstructor = errorConstructors[superType];
            } else if ((typeof superType === 'function') && (superType.prototype instanceof UTError)) {
                superConstructor = superType;
            }
            errorConstructors[type] = createErrorConstructor(type, superConstructor);
        }
        return errorConstructors[type];
    },
    get: function(type) {
        return type ? errorConstructors[type] : errorConstructors;
    }
};
