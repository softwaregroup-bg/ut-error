const interpolationRegex = /\{([^}]*)\}/g;
const interpolate = (message, params) => {
    return message.replace(interpolationRegex, (placeHolder, label) => {
        return typeof params[label] === 'undefined' ? `?${label}?` : params[label];
    });
};
class UTError extends Error {
    constructor(x) {
        super();
        Error.call(this);
        Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
        let defaultMessage = this.defaultMessage;
        if (x instanceof Error) {
            this.cause = x;
        } else {
            Object.assign(this, x);
        }
        this.message = interpolate(defaultMessage || x.message || 'Unknown Error', x.params || {});
    }
};

module.exports = UTError;
