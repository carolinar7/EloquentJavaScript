// cat and car
verify(/ca(r|t)/,
       ["my car", "bad cats"],
       ["camper", "high art"]);

// pop and prop
verify(/pr?op/,
       ["pop culture", "mad props"],
       ["plop", "prrrop"]);

// ferry ferret and ferrari
verify(/ferr((et)|(y)|(ari))/,
       ["ferret", "ferry", "ferrari"],
       ["ferrum", "transfer A"]);

// any word ending in ious
verify(/\w*ious(\s\w*|$)/,
       ["how delicious", "spacious room"],
       ["ruinous", "consciousness"]);

// a whitespace character followed by a period, comma, colon, or semicolon
verify(/\s(\.|,|:|;)/,
       ["bad punctuation ."],
       ["escape the period"]);

// a word longer than six letters
verify(/\w{6}\w+/,
       ["Siebentausenddreihundertzweiundzwanzig", "asldfjlsakdfjd lasf"],
       ["no", "three small words", "abcdef"]);

// word without the letter e
verify(/\b([a-d]|[f-z])+\b/i,
       ["red platypus", "wobbling nest"],
       ["earth bed", "learning ape", "BEET"]);


function verify(regexp, yes, no) {
  // Ignore unfinished exercises
  if (regexp.source == "...") return;
  for (let str of yes) if (!regexp.test(str)) {
    console.log(`Failure to match '${str}'`);
  }
  for (let str of no) if (regexp.test(str)) {
    console.log(`Unexpected match for '${str}'`);
  }
}