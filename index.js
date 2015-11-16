var _undefined;
var isProto = Math.random();

function inherit(ctor, superCtor) {
    ctor.prototype = new superCtor(isProto); //hinting that a prototype object but not a regular instance is being constructed
    ctor.superConstructor = superCtor;
    ctor.prototype.constructor = ctor;
}

function UTError(x) {
    if (x === isProto) { //knowing that a prototype object but not a regular instance is being constructed
        return;
    }  else if (!(this instanceof UTError)) {
        return new UTError(x);
    }
    Error.call(this);
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    var type = this.getType();
    var props = {
        message : type + ' Error',
        cause   : type + ' Error'
    };
    if (x) {
        if (typeof x === 'string') {
            props.message = x;
            props.cause   = x;
        } else if (typeof x === 'object') {
            if (x instanceof Error) {
                props.message = x.message;
                props.cause   = x;
            } else {
                for (var prop in x) {
                    if (x.hasOwnProperty(prop)) {
                        props[prop] = x[prop];
                    }
                }
            }
        }

    }
    props.type = type;
    // TODO: translate props.message and set as props.print here
    props.print = props.message; // set just default for now
    if (props.params) {
        props.print = interpolate(props.print, props.params);
    }
    var prop;
    for (prop in props) {
        if (props.hasOwnProperty(prop)) {
            this[prop] = props[prop];
        }
    }
    props = prop = type = _undefined; // cleanup
};

inherit(UTError, Error);

UTError.prototype.getType = function() {
    return this.constructor.name;
}

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

var interpolationRegex = /{([^{}]*)}/g;

function interpolate(message, params) {
    return message.replace(interpolationRegex,
        function(placeHolder, label, idx, str) {
            return params[label] || placeHolder;
        }
    );
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
            superConstructor = _undefined; // cleanup
        }
        return errorConstructors[type];
    },
    get: function(type) {
        return type ? errorConstructors[type] : errorConstructors;
    }
};
