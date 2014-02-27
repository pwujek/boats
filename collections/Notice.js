// Notice.js
// * EJSON record definition

function Notice (title, message) {
  this.title = title;
  this.message = message;
}

Notice.prototype = {
  constructor: Notice,

  toString: function () {
    return this.title + ' - ' + this.message;
  },

  // Return a copy of this instance
  clone: function () {
    return new Notice(this.title, this.message);
  },

  // Compare this instance to another instance
  equals: function (other) {
    if (!(other instanceof Notice))
      return false;

    return this.title == other.title 
        && this.message == other.message;
  },

  // Return the name of this type which should be the same as the one
  // padded to EJSON.addType
  typeName: function () {
    return "Notice";
  },

  // Serialize the instance into a JSON-compatible value. It could
  // be an object, string, or whatever would naturally serialize
  // to JSON
  toJSONValue: function () {
    return {
      title: this.title,
      message: this.message
    };
  }
};

// Tell EJSON about our new custom type
EJSON.addType("Notice", function fromJSONValue(value) {
  // the parameter - value - will look like whatever we
  // returned from toJSONValue from above.
  console.log(value);
  return new Notice(value.title, value.message);
});
