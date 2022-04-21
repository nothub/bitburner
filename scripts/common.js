/* eslint-disable no-unused-vars */

function buildEvictingQueue(maxElements) {
    const array = [];
    array.push = function () {
        Array.prototype.push.apply(this, arguments);
        while (this.length > maxElements) this.shift();
        return this.length;
    }
    return array;
}

function stripNonAscii(text) {
    /* eslint-disable-next-line no-control-regex */
    return text.replace(/[^\x00-\x7F]/g, "");
}

function isDefined(object) {
    return object !== undefined && object !== null;
}

function isBool(object) {
    return isDefined(object) && typeof object === "boolean";
}

function isNumber(object) {
    return isDefined(object) && (typeof object === "number" || typeof object === "bigint");
}

function isString(object) {
    return isDefined(object) && typeof object === "string" && object.length > 0;
}

function isIterable(object) {
    /* eslint-disable-next-line no-undef */
    const iterFunc = object[Symbol.iterator];
    return isDefined(object) && typeof iterFunc === 'function';
}
