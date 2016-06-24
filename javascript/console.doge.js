/*
#	wow, console.doge()
#	 
#	@method console.doge	
#	@author J.Dettmar
*/


(function() {
  var root,
    __slice = [].slice;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.console = root.console || {};

  root.console.doge = function() {
    var args, color, log, phrase, rand, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    rand = function(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    };
    log = ["wow", "such", "much"];
    color = Math.random().toString(16).slice(2, 8);
    phrase = "%c " + ((rand(log)) + "!");
    args.unshift("color:#" + color + ";font-family:'Comic Sans MS','Comic Sans';font-size:larger;");
    args.unshift(phrase);
    return (_ref = root.console.log) != null ? _ref.apply(console, args) : void 0;
  };

}).call(this);
