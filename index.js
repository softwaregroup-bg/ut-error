var errno = require('errno');
var createError = errno.custom.createError;
var CustomErrorConstructor = errno.custom.CustomError;
var errors = {};

module.exports = {
    init: function(bus) {
        //
    },
    getInstance: function(Type, SuperType) {
        if (!errors[Type]) {
            var defaultMessage = Type + ' Error';
            var SuperConstructor = null;
            if (SuperType) {
                if ((typeof SuperType === 'string') && errors[SuperType]) {
                    SuperConstructor = errors[SuperType].getConstructor();
                } else if ((typeof SuperType === 'object') && SuperType.getConstructor) {
                    SuperConstructor = SuperType.getConstructor();
                } else if ((typeof SuperType === 'function') && SuperType.prototype instanceof CustomErrorConstructor) {
                    SuperConstructor = SuperType
                }
            }
            var ErrorConstructor = SuperConstructor ? createError(Type, SuperConstructor) : createError(Type);
            errors[Type] = {
                getConstructor  : function() {
                    return ErrorConstructor;
                },
                generate        : function(params) { // object literal or JS error
                    var e = new ErrorConstructor(params.message || defaultMessage, params.cause || params);
                    e.code = params.code;
                    return e;
                }
            }
        }
        return errors[Type];
    }
};
