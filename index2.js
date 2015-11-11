var util = require('util');

function setProps(props) {
    Error.call(this);
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    for (var prop in props) {
        if (props.hasOwnProperty(prop)) {
            this[prop] = props[prop];
        }
    }
}

function CustomError(type, message, context) {
    setProps.call(this, {
        type: type,
        name: type,
        message: message,
        context: context
    });
};

util.inherits(CustomError, Error);

function createError(type, superType) {
    function Err(message, context) {
        setProps.call(this, {
            type: type,
            name: type,
            message: message,
            context: context
        });
    }
    util.inherits(Err, superType || CustomError);
    return Err;
}

var errors = {};

module.exports = {
    init: function(bus) {

    },
    define: function(type, superType) {
        if (!errors[type]) {
            var defaultMessage = type + ' Error';
            var superConstructor = null;
            if (superType) {
                if ((typeof superType === 'string') && errors[superType]) {
                    superConstructor = errors[superType].getConstructor();
                } else if ((typeof superType === 'object') && (typeof superType.getConstructor === 'function')) {
                    superConstructor = superType.getConstructor();
                } else if ((typeof superType === 'function') && (superType.prototype instanceof CustomError)) {
                    superConstructor = superType;
                }
            }
            var errorConstructor = superConstructor ? createError(type, superConstructor) : createError(type);
            errors[type] = {
                getConstructor  : function() {
                    return errorConstructor;
                },
                generate        : function(params) { // string or object literal or JS error
                    var e = new errorConstructor(params.message || defaultMessage, params.context || params);
                    e.code = params.code;
                    return e;
                }
            }
        }
        return errors[type];
    },
    get: function(type) {
        return errors[type];
    }
};
