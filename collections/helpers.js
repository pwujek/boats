typeOf = function (value) {
  if (typeof value.typeName === 'function')
    return value.typeName();
  else
    return Object.prototype.toString.call(value);
};

bufferToString = function (buffer) {
  return String.fromCharCode.apply(null, buffer);
};
