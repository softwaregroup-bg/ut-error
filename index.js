function inherit(ctor, superCtor) {
    ctor.prototype = new superCtor(null); //hinting that a prototype object but not a regular instance is being constructed
    ctor.superConstructor = superCtor;
    ctor.prototype.constructor = ctor;
}

function UTError(config) {
    if (config === null) { //knowing that a prototype object but not a regular instance is being constructed
        return;
    }
    Error.call(this);
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    for (var prop in config) {
        if (config.hasOwnProperty(prop)) {
            this[prop] = config[prop]
        }
    }
};

inherit(UTError, Error);

function createErrorType(type, superType) {
    function CustomUTError(config) {
        if (config === null) { //knowing that a prototype object but not a regular instance is being constructed
            return;
        } else if (!config.type) { // should happen only once (right before start inheriting from super classes)
            config.type    = type;
            config.name    = type;
            config.message = interpolate(config.message, config.params);
        }
        superType.call(this, config);
    }
    inherit(CustomUTError, superType);
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

var errors = {};

module.exports = {
    init: function(bus) {

    },
    define: function(type, superType) {
        if (!errors[type]) {
            var superConstructor = null;
            if (superType) {
                if ((typeof superType === 'string') && errors[superType]) {
                    superConstructor = errors[superType].getConstructor();
                } else if ((typeof superType === 'object') && (typeof superType.getConstructor === 'function')) {
                    superConstructor = superType.getConstructor();
                } else if ((typeof superType === 'function') && (superType.prototype instanceof UTError)) {
                    superConstructor = superType;
                } else {
                    superConstructor = UTError;
                }
            } else {
                superConstructor = UTError;
            }
            var errorConstructor = createErrorType(type, superConstructor);
            errors[type] = {
                getConstructor  : function() {
                    return errorConstructor;
                },
                getSuperConstructor  : function() {
                    return superConstructor;
                },
                generate        : function(x) { // undefined or string or object literal or JS error
                    var config  = {
                        message : type + ' Error',
                        cause   : type + ' Error',
                        params  : {}
                    };
                    if (x) {
                        if (typeof x === 'string') {
                            config.message = x;
                            config.cause   = x;
                        } else if (typeof x === 'object') {
                            if (x instanceof Error) {
                                config.message = x.message;
                                config.cause   = x;
                            } else {
                                for (var prop in x) {
                                    if (x.hasOwnProperty(prop)) {
                                        config[prop] = x[prop];
                                    }
                                }
                            }
                        }
                    }
                    return new errorConstructor(config);
                }
            }
        }
        return errors[type];
    },
    get: function(type) {
        return type ? errors[type] : errors;
    }
};
