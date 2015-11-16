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
    var name = this.getName();
    var props = {
        message : name + ' Error'
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
    this.name = name;
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

function createErrorConstructor(name, SuperCtor) {
    var type = SuperCtor === UTError ? name : SuperCtor.prototype.getType() + '.' + name;
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

    CustomUTError.prototype.getName = function() {
        return name;
    };

    return CustomUTError;
}

var errorConstructors = {};

module.exports = {
    init: function(bus) {

    },
    define: function(name, superType) {
        if (!errorConstructors[name]) {
            var SuperCtor = UTError;
            if ((typeof superType === 'string') && errorConstructors[superType]) {
                SuperCtor = errorConstructors[superType];
            } else if ((typeof superType === 'function') && (superType.prototype instanceof UTError)) {
                SuperCtor = superType;
            }
            errorConstructors[name] = createErrorConstructor(name, SuperCtor);
        }
        return errorConstructors[name];
    },
    get: function(name) {
        return name ? errorConstructors[name] : errorConstructors;
    }
};
