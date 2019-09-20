import _ from "lodash";

export default function nest(seq, keys) {
  if (!keys.length) return seq;
  var first = keys[0];
  var rest = keys.slice(1);
  return _.mapValues(_.groupBy(seq, first), function(value) {
    return nest(value, rest);
  });
}
