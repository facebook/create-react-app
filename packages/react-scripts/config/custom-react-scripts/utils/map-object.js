module.exports = function mapObject(obj, fn, toArray) {
  return Object.keys(obj).reduce(function(final, key) {
    var result = fn(obj[key], key);
    if (!result) {
      return final;
    }
    if (toArray) {
      final.push(result);
    }
    final[key] = result;
    return final;
  }, toArray ? [] : {});
};
