(function() {
  var slice = [].slice;

  this.EventMixin = {
    _eventHandlers: function() {
      return this.__eventHandlers || (this.__eventHandlers = {});
    },
    _getHandlers: function(name) {
      var base;
      (base = this._eventHandlers())[name] || (base[name] = []);
      return this._eventHandlers()[name];
    },
    _setHandlers: function(name, value) {
      var base;
      (base = this._eventHandlers())[name] || (base[name] = value);
    },
    on: function(name, callback) {
      if (!callback) {
        return;
      }
      return this._getHandlers(name).push(callback);
    },
    off: function(name, callback) {
      if (!name) {
        if (this.__eventHandlers != null) {
          delete this.__eventHandlers;
        }
        return;
      }
      if (!callback) {
        this._setHandlers(name, []);
      } else {
        this._setHandlers(name, this._getHandlers(name).filter(function(c) {
          return c === callback;
        }));
      }
    },
    trigger: function() {
      var args, cb, i, len, name, ref;
      name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ref = this._getHandlers(name);
      for (i = 0, len = ref.length; i < len; i++) {
        cb = ref[i];
        cb.apply(this, args);
      }
    }
  };

}).call(this);

(function() {
  var moduleKeywords,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  moduleKeywords = ['extended', 'included'];

  this.Module = (function() {
    function Module() {}

    Module.extend = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(moduleKeywords, key) < 0) {
          this[key] = value;
        }
      }
      if ((ref = obj.extended) != null) {
        ref.apply(this);
      }
      return this;
    };

    Module.include = function(obj) {
      var key, ref, value;
      for (key in obj) {
        value = obj[key];
        if (indexOf.call(moduleKeywords, key) < 0) {
          this.prototype[key] = value;
        }
      }
      if ((ref = obj.included) != null) {
        ref.apply(this);
      }
      return this;
    };

    return Module;

  })();

}).call(this);


/*
 * Elegant pattern to simulate namespace in CoffeeScript
#
 * @author Maks
 */

(function() {
  (function(root) {
    var fn;
    fn = function() {
      var Class, args, name, obj, subpackage, target;
      args = arguments[0];
      target = root;
      while (true) {
        for (subpackage in args) {
          obj = args[subpackage];
          target = target[subpackage] || (target[subpackage] = {});
          args = obj;
        }
        if (typeof args !== 'object') {
          break;
        }
      }
      Class = args;
      if (arguments[0].hasOwnProperty('global')) {
        target = root;
      }
      name = Class.toString().match(/^function\s(\w+)\(/)[1];
      return target[name] = Class;
    };
    root.namespace = fn;
    return root.module = fn;
  })(typeof global !== "undefined" && global !== null ? global : window);

}).call(this);

(function() {
  var slice = [].slice;

  this.PropertyMixin = {
    property: function(prop, options) {
      return Object.defineProperty(this.prototype, prop, options);
    },
    addProperty: function() {
      var cbs, name;
      name = arguments[0], cbs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      return this.property(name, {
        get: function() {
          return this["_" + name];
        },
        set: function(value) {
          var cb, i, len, n, r;
          n = "set" + (name.capitalize());
          if (this[n] != null) {
            r = this[n](value);
          } else {
            r = this.setProp(name, value);
          }
          for (i = 0, len = cbs.length; i < len; i++) {
            cb = cbs[i];
            if (typeof this[cb] === "function") {
              this[cb]();
            }
          }
          return r;
        }
      });
    },
    extended: function() {
      return this.prototype.setProp = function(name, value) {
        if (this["_" + name] !== value) {
          this["_" + name] = value;
          if (typeof this.trigger === "function") {
            this.trigger("change:" + name, this["_" + name]);
          }
        }
        return this["_" + name];
      };
    }
  };

}).call(this);

(function() {
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

}).call(this);

(function() {
  var slice = [].slice;

  this.ViewMixin = {
    $: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (this.$el) {
        return $.apply($, args.concat([this.$el]));
      } else {
        return $.apply($, args);
      }
    },
    setElement: function(el) {
      this.$el = $(el);
      this.el = this.$el[0];
      return this.setUI();
    },
    setUI: function() {
      var key, ref, results, tmp, value;
      this.ui = {};
      ref = this.constructor.prototype.ui;
      results = [];
      for (key in ref) {
        value = ref[key];
        tmp = this.ui["$" + key] = this.$(value);
        results.push(this.ui[key] = tmp[0]);
      }
      return results;
    }
  };

}).call(this);

(function() {
  var Cup,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    models: Cup = (function(superClass) {
      extend(Cup, superClass);

      Cup.extend(PropertyMixin);

      Cup.include(EventMixin);

      Cup.addProperty('row');

      Cup.addProperty('col');

      Cup.addProperty('type');

      Cup.addProperty('selected');

      function Cup(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.selected = false;
      }

      return Cup;

    })(Module)
  });

}).call(this);

(function() {
  var CupsCounter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    models: CupsCounter = (function(superClass) {
      extend(CupsCounter, superClass);

      CupsCounter.extend(PropertyMixin);

      CupsCounter.include(EventMixin);

      CupsCounter.addProperty('all', 'checkDone');

      CupsCounter.addProperty('score', 'checkDone');

      CupsCounter.addProperty('done');

      function CupsCounter(name, all) {
        this.name = name;
        this.all = all;
        this.score = 0;
      }

      CupsCounter.prototype.checkDone = function() {
        return this.done = this.all <= this.score;
      };

      return CupsCounter;

    })(Module)
  });

}).call(this);

(function() {
  var Game,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    models: Game = (function(superClass) {
      extend(Game, superClass);

      Game.extend(PropertyMixin);

      Game.include(EventMixin);

      Game.addProperty('score');

      Game.addProperty('moves', 'checkFail');

      Game.addProperty('width');

      Game.addProperty('height');

      Game.addProperty('types');

      Game.addProperty('win');

      Game.addProperty('fail');

      function Game(options) {
        this.checkWinHandler = _.bind(this.checkWin, this);
        this.setOptions(options);
      }

      Game.prototype.reset = function() {
        this.score = 0;
        this.win = false;
        return this.fail = false;
      };

      Game.prototype.setOptions = function(options) {
        this.reset();
        this.height = options.height;
        this.width = options.width;
        this.moves = options.moves;
        this.types = options.types;
        this.setTargets(options.targets);
        return this.setGrid();
      };

      Game.prototype.setTargets = function(targets) {
        var base, key, ref, results, value;
        if (this.targets) {
          ref = this.targets;
          for (key in ref) {
            value = ref[key];
            value.off('change:done', this.checkWinHandler);
          }
        }
        this.counters = this.targets = {};
        results = [];
        for (key in targets) {
          value = targets[key];
          this.targets[key] = new models.CupsCounter(key, value);
          results.push(typeof (base = this.targets[key]).on === "function" ? base.on('change:done', this.checkWinHandler) : void 0);
        }
        return results;
      };

      Game.prototype.setGrid = function() {
        if (this.grid) {
          this.grid.off();
        }
        this.grid = new models.Grid(this);
        this.grid.on('change', (function(_this) {
          return function() {
            return _this.trigger('change:grid');
          };
        })(this));
        this.grid.on('swap', (function(_this) {
          return function() {
            return _this.moves -= 1;
          };
        })(this));
        return this.grid.on('matches', (function(_this) {
          return function(score, types) {
            _this.updateTarget(types);
            return _this.updateScore(score);
          };
        })(this));
      };

      Game.prototype.updateTarget = function(types) {
        var key, ref, results, value;
        results = [];
        for (key in types) {
          value = types[key];
          results.push((ref = this.targets[key]) != null ? ref.score += value : void 0);
        }
        return results;
      };

      Game.prototype.updateScore = function(score) {
        return this.score += _.chain(score).map(function(s) {
          return (s - 1) * 5;
        }).reduce((function(memo, v) {
          return memo + v;
        }), 0).value();
      };

      Game.prototype.checkWin = function() {
        var key, ref, value, w;
        w = true;
        ref = this.targets;
        for (key in ref) {
          value = ref[key];
          w && (w = value.done);
        }
        return this.win = w;
      };

      Game.prototype.checkFail = function() {
        return this.fail = this.fail || this.moves <= 0;
      };

      return Game;

    })(Module)
  });

}).call(this);

(function() {
  var Grid,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    models: Grid = (function(superClass) {
      extend(Grid, superClass);

      Grid.extend(PropertyMixin);

      Grid.include(EventMixin);

      Grid.addProperty('lock');

      Grid.addProperty('height');

      Grid.addProperty('width');

      Grid.addProperty('types');

      function Grid(model) {
        this.lock = 0;
        this.model = model;
        this.width = this.model.width;
        this.height = this.model.height;
        this.types = this.model.types;
        this.swaped = false;
        this.on('change', _.bind(this.onChange, this));
        this.on('change:lock', _.bind(this.onChangeLock, this));
        this.init();
      }

      Grid.prototype.init = function() {
        var col, j, k, len, len1, ref, ref1, row, v;
        this.empty();
        while (true) {
          ref = this.grid;
          for (row = j = 0, len = ref.length; j < len; row = ++j) {
            v = ref[row];
            ref1 = this.grid[row];
            for (col = k = 0, len1 = ref1.length; k < len1; col = ++k) {
              v = ref1[col];
              this.grid[row][col] = this.newCup(row, col);
            }
          }
          if (this.findMatches().length) {
            continue;
          }
          if (!this.hasPossible()) {
            continue;
          }
          break;
        }
        return this.trigger('change');
      };

      Grid.prototype.empty = function() {
        var index, j, len, ref, results, value;
        this.grid = new Array(this.height);
        ref = this.grid;
        results = [];
        for (index = j = 0, len = ref.length; j < len; index = ++j) {
          value = ref[index];
          results.push(this.grid[index] = new Array(this.width));
        }
        return results;
      };

      Grid.prototype.normalizeGrid = function() {
        return this.eachCups((function(_this) {
          return function(cup, x, y) {
            cup.col = x;
            return cup.row = y;
          };
        })(this));
      };

      Grid.prototype.hasEmpty = function() {
        var cup, j, k, len, len1, r, ref, row;
        r = false;
        ref = this.grid;
        for (j = 0, len = ref.length; j < len; j++) {
          row = ref[j];
          if (!r) {
            for (k = 0, len1 = row.length; k < len1; k++) {
              cup = row[k];
              if (!r) {
                r || (r = cup == null);
              }
            }
          }
        }
        return r;
      };

      Grid.prototype.fillCol = function(col) {
        var j, len, offset, ref, results, row, tmp, y;
        offset = 0;
        ref = this.grid;
        results = [];
        for (y = j = 0, len = ref.length; j < len; y = ++j) {
          row = ref[y];
          tmp = y;
          while (!row[col]) {
            tmp += 1;
            row[col] = this.getCup(col, tmp);
          }
          if (row[col].row >= this.height) {
            offset += 1;
            results.push(row[col].row += offset - 1);
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      Grid.prototype.getCup = function(x, y) {
        var c;
        if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
          return this.newCup(y, x);
        } else {
          c = this.grid[y][x];
          this.grid[y][x] = null;
          return c;
        }
      };

      Grid.prototype.findVMatch = function(row, col) {
        var c, j, matches, ref, ref1;
        matches = [this.grid[row][col]];
        for (c = j = ref = col, ref1 = this.width - 2; ref <= ref1 ? j <= ref1 : j >= ref1; c = ref <= ref1 ? ++j : --j) {
          if (this.grid[row][c].type === this.grid[row][c + 1].type) {
            matches.push(this.grid[row][c + 1]);
          } else {
            return matches;
          }
        }
        return matches;
      };

      Grid.prototype.findHMatch = function(row, col) {
        var j, matches, r, ref, ref1;
        matches = [this.grid[row][col]];
        for (r = j = ref = row, ref1 = this.height - 2; ref <= ref1 ? j <= ref1 : j >= ref1; r = ref <= ref1 ? ++j : --j) {
          if (this.grid[r][col].type === this.grid[r + 1][col].type) {
            matches.push(this.grid[r + 1][col]);
          } else {
            return matches;
          }
        }
        return matches;
      };

      Grid.prototype.findMatches = function() {
        var col, m, matches, row;
        matches = [];
        row = 0;
        while (row < this.height) {
          col = 0;
          while (col < this.width - 2) {
            m = this.findVMatch(row, col);
            if (m.length > 2) {
              matches.push(m);
            }
            col += m.length;
          }
          row += 1;
        }
        col = 0;
        while (col < this.width) {
          row = 0;
          while (row < this.height - 2) {
            m = this.findHMatch(row, col);
            if (m.length > 2) {
              matches.push(m);
            }
            row += m.length;
          }
          col += 1;
        }
        return matches;
      };

      Grid.prototype.findAndRemoveMatches = function() {
        var cups, matches, score, types;
        matches = this.findMatches();
        cups = _.chain(matches).flatten().uniq().value();
        types = _.countBy(cups, function(c) {
          return c.type;
        });
        score = _.map(matches, function(m) {
          return m.length;
        });
        this.trigger('matches', score, types);
        if (cups.length) {
          this.removeCups(cups);
        }
        return Boolean(cups.length);
      };

      Grid.prototype.matchType = function(col, row, type) {
        if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
          return false;
        }
        return this.grid[row][col].type === type;
      };

      Grid.prototype.matchPattern = function(col, row, mustHave, needOne) {
        var j, k, len, len1, m, n, type;
        type = this.grid[row][col].type;
        for (j = 0, len = mustHave.length; j < len; j++) {
          m = mustHave[j];
          if (!this.matchType(col + m[0], row + m[1], type)) {
            return false;
          }
        }
        for (k = 0, len1 = needOne.length; k < len1; k++) {
          n = needOne[k];
          if (this.matchType(col + n[0], row + n[1], type)) {
            return true;
          }
        }
        return false;
      };

      Grid.prototype.hasPossible = function() {
        var cup, j, k, len, len1, name, pattern, patterns, ref, row, x, y;
        patterns = {
          hNear: [[[1, 0]], [[-2, 0], [-1, -1], [-1, 1], [2, -1], [2, 1], [3, 0]]],
          vNear: [[[0, 1]], [[0, -2], [-1, -1], [1, -1], [-1, 2], [1, 2], [0, 3]]],
          h: [[[2, 0]], [[1, -1], [1, 1]]],
          v: [[[0, 2]], [[-1, 1], [1, 1]]]
        };
        ref = this.grid;
        for (y = j = 0, len = ref.length; j < len; y = ++j) {
          row = ref[y];
          for (x = k = 0, len1 = row.length; k < len1; x = ++k) {
            cup = row[x];
            for (name in patterns) {
              pattern = patterns[name];
              if (this.matchPattern(x, y, pattern[0], pattern[1])) {
                return true;
              }
            }
          }
        }
        return false;
      };

      Grid.prototype.eachCups = function(cb) {
        var cup, j, len, ref, results, row, x, y;
        ref = this.grid;
        results = [];
        for (y = j = 0, len = ref.length; j < len; y = ++j) {
          row = ref[y];
          results.push((function() {
            var k, len1, results1;
            results1 = [];
            for (x = k = 0, len1 = row.length; k < len1; x = ++k) {
              cup = row[x];
              if (cup) {
                results1.push(typeof cb === "function" ? cb(cup, x, y) : void 0);
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          })());
        }
        return results;
      };

      Grid.prototype.getCupOrNull = function(col, row) {
        if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
          return null;
        }
        return this.grid[row][col];
      };

      Grid.prototype.onChange = function() {
        if (this.hasEmpty()) {
          this.fillEmpty();
        }
      };

      Grid.prototype.onChangeLock = function() {
        if (!this.lock && this.swaped) {
          this.trigger('swap');
          return this.swaped = false;
        }
      };

      Grid.prototype.newCup = function(row, col) {
        var cup;
        cup = new models.Cup(row, col, this.randomType());
        cup.on('click', (function(_this) {
          return function() {
            if (_this.lock) {
              return;
            }
            return _this.onCupClick(cup);
          };
        })(this));
        cup.on('move', (function(_this) {
          return function(x, y) {
            if (_this.lock) {
              return;
            }
            return _this.onCupMove(cup, x, y);
          };
        })(this));
        return cup;
      };

      Grid.prototype.removeCup = function(cup) {
        var col, row;
        if (this.selected === cup) {
          this.selected = null;
        }
        row = cup.row;
        col = cup.col;
        cup.off();
        return this.grid[row][col] = null;
      };

      Grid.prototype.randomType = function() {
        return this.types[Math.random() * this.types.length | 0];
      };

      Grid.prototype.isNear = function(c1, c2) {
        return (c1.row === c2.row && Math.abs(c1.col - c2.col) === 1) || (c1.col === c2.col && Math.abs(c1.row - c2.row) === 1);
      };

      Grid.prototype.onCupClick = function(cup) {
        if (this.selected) {
          if (this.isNear(this.selected, cup)) {
            this.trySwap(this.selected, cup);
            return this.selected = null;
          } else {
            cup.selected = !cup.selected;
            if (cup !== this.selected) {
              this.selected.selected = false;
              return this.selected = cup;
            } else {
              return this.selected = null;
            }
          }
        } else {
          cup.selected = !cup.selected;
          return this.selected = cup;
        }
      };

      Grid.prototype.onCupMove = function(cup, x, y) {
        var c1, c2;
        c1 = cup;
        c2 = this.getCupOrNull(c1.col + x, c1.row + y);
        if (c1 && c2) {
          if (this.selected) {
            this.selected.selected = false;
            this.selected = null;
          }
          return this.trySwap(c1, c2);
        }
      };

      Grid.prototype.trySwap = function(c1, c2) {
        var animHandlers, doSwap, endSwap, startSwap;
        startSwap = (function(_this) {
          return function() {
            c1.selected = true;
            return c2.selected = true;
          };
        })(this);
        endSwap = (function(_this) {
          return function() {
            c1.selected = false;
            return c2.selected = false;
          };
        })(this);
        doSwap = (function(_this) {
          return function() {
            var c, r, ref, ref1, ref2;
            _this.grid[c1.row][c1.col] = c2;
            _this.grid[c2.row][c2.col] = c1;
            ref = [c2.row, c2.col], r = ref[0], c = ref[1];
            ref1 = [c1.row, c1.col], c2.row = ref1[0], c2.col = ref1[1];
            return ref2 = [r, c], c1.row = ref2[0], c1.col = ref2[1], ref2;
          };
        })(this);
        animHandlers = (function(_this) {
          return function() {
            return [_.bind(c1.view.move, c1.view, c2.row, c2.col), _.bind(c2.view.move, c2.view, c1.row, c1.col)];
          };
        })(this);
        startSwap();
        return this.lockAndExec(animHandlers(), (function(_this) {
          return function() {
            doSwap();
            if (!_this.findAndRemoveMatches()) {
              return _this.lockAndExec(animHandlers(), function() {
                doSwap();
                return endSwap();
              });
            } else {
              _this.swaped = true;
              return endSwap();
            }
          };
        })(this));
      };

      Grid.prototype.fillEmpty = function() {
        var anims, col, j, ref;
        for (col = j = 0, ref = this.width - 1; 0 <= ref ? j <= ref : j >= ref; col = 0 <= ref ? ++j : --j) {
          this.fillCol(col);
        }
        this.trigger('change');
        anims = [];
        this.eachCups((function(_this) {
          return function(cup, x, y) {
            if (cup.row !== y) {
              return anims.push(_.bind(cup.view.move, cup.view, y, x));
            }
          };
        })(this));
        return this.lockAndExec(anims, (function(_this) {
          return function() {
            _this.normalizeGrid();
            _this.trigger('change');
            if (!_this.findAndRemoveMatches()) {
              if (!_this.hasPossible()) {
                return _this.shuffle();
              }
            }
          };
        })(this));
      };

      Grid.prototype.canShuffle = function() {
        return _.chain(this.grid).flatten().countBy((function(_this) {
          return function(c) {
            return c.type;
          };
        })(this)).values().any((function(_this) {
          return function(c) {
            return c > 2;
          };
        })(this)).value();
      };

      Grid.prototype.shuffle = function() {
        var anims, cups;
        if (!this.canShuffle()) {
          throw new Error("Can't shuffle");
        }
        cups = _.chain(this.grid).flatten();
        while (!this.hasPossible() || this.findMatches().length) {
          this.grid = cups.shuffle().groupBy((function(_this) {
            return function(v, i) {
              return Math.floor(i / _this.width);
            };
          })(this)).toArray().value();
        }
        anims = [];
        this.eachCups((function(_this) {
          return function(cup, x, y) {
            return anims.push(_.bind(cup.view.move, cup.view, y, x));
          };
        })(this));
        return this.lockAndExec(anims, (function(_this) {
          return function() {
            _this.normalizeGrid();
            return _this.trigger('change');
          };
        })(this));
      };

      Grid.prototype.removeCups = function(cups) {
        var anims, cup, j, len;
        anims = [];
        for (j = 0, len = cups.length; j < len; j++) {
          cup = cups[j];
          anims.push(_.bind(cup.view.hide, cup.view));
        }
        return this.lockAndExec(anims, (function(_this) {
          return function() {
            var k, len1;
            for (k = 0, len1 = cups.length; k < len1; k++) {
              cup = cups[k];
              _this.removeCup(cup);
            }
            return _this.trigger('change');
          };
        })(this));
      };

      Grid.prototype.lockAndExec = function(h, c) {
        if (h == null) {
          h = [];
        }
        this.lock += 1;
        if (h.length > 0) {
          return async.parallel(h, (function(_this) {
            return function() {
              if (typeof c === "function") {
                c();
              }
              return _this.lock -= 1;
            };
          })(this));
        } else {
          if (typeof c === "function") {
            c();
          }
          return this.lock -= 1;
        }
      };

      return Grid;

    })(Module)
  });

}).call(this);

(function() {
  var Canvas,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    ui: Canvas = (function(superClass) {
      extend(Canvas, superClass);

      Canvas.extend(PropertyMixin);

      Canvas.include(ViewMixin);

      Canvas.include(EventMixin);

      Canvas.addProperty('model');

      Canvas.addProperty('cellSize');

      Canvas.property('width', {
        get: function() {
          return this.el.width;
        },
        set: function(val) {
          return this.el.width = val;
        }
      });

      Canvas.property('height', {
        get: function() {
          return this.el.height;
        },
        set: function(val) {
          return this.el.height = val;
        }
      });

      Canvas.property('handlers', {
        get: function() {
          return this._handlers != null ? this._handlers : this._handlers = {
            onTick: _.bind(this.tick, this),
            onUpdateGrid: _.bind(this.updateGrid, this)
          };
        }
      });

      function Canvas(el, model) {
        this.setElement(el);
        this.model = model;
        this.stage = new createjs.Stage(this.el);
        createjs.Touch.enable(this.stage);
        this.resetSize();
        this.initHandlers();
        this.updateGrid();
      }

      Canvas.prototype.initHandlers = function() {
        createjs.Ticker.addEventListener('tick', this.handlers.onTick);
        return this.model.on('change:grid', this.handlers.onUpdateGrid);
      };

      Canvas.prototype.resetSize = function() {
        var ch, cs, cw, h, w;
        this.width = this.$el.width();
        this.height = this.$el.height();
        cw = this.width / this.model.width;
        ch = this.height / this.model.height;
        cs = cw < ch ? cw : ch;
        w = cs * this.model.width;
        h = cs * this.model.height;
        this.stage.set({
          regX: (w - this.width) / 2,
          regY: (h - this.height) / 2
        });
        return this.cellSize = cs;
      };

      Canvas.prototype.updateGrid = function() {
        return this.model.grid.eachCups((function(_this) {
          return function(cup, x, y) {
            if (cup.view == null) {
              cup.view = new ui.Cup(x, y, _this.cellSize, cup);
            }
            return _this.stage.addChild(cup.view.shape);
          };
        })(this));
      };

      Canvas.prototype.tick = function(event) {
        return this.stage.update(event);
      };

      return Canvas;

    })(Module)
  });

}).call(this);

(function() {
  var Counter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    ui: Counter = (function(superClass) {
      extend(Counter, superClass);

      Counter.extend(PropertyMixin);

      Counter.include(ViewMixin);

      Counter.addProperty('value');

      Counter.addProperty('model');

      function Counter(el, prop, model) {
        this.prop = prop;
        this.setElement(el);
        this.model = model;
      }

      Counter.prototype.setValue = function(value) {
        this._value = Number(value);
        this.$el.text(this._value);
        return this._value;
      };

      Counter.prototype.setModel = function(model) {
        var base, base1;
        if (this._handler == null) {
          this._handler = _.bind(this.setValue, this);
        }
        if (this._model) {
          if (typeof (base = this._model).off === "function") {
            base.off("change:" + this.prop, this._handler);
          }
        }
        this._model = model;
        if (!this._model) {
          this.value = 0;
          return this._model;
        }
        this.value = this._model[this.prop];
        if (typeof (base1 = this._model).on === "function") {
          base1.on("change:" + this.prop, this._handler);
        }
        return this._model;
      };

      return Counter;

    })(Module)
  });

}).call(this);

(function() {
  var Cup,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  namespace({
    ui: Cup = (function(superClass) {
      extend(Cup, superClass);

      Cup.extend(PropertyMixin);

      Cup.include(EventMixin);

      Cup.prototype.anim = {
        delay: 400,
        type: createjs.Ease.circInOut
      };

      Cup.prototype.colors = {
        red: "#F15A5A",
        yellow: "#F0C419",
        green: "#4EBA6F",
        blue: "#2D95BF",
        magenta: "#955BA5"
      };

      Cup.prototype.darkenColors = {
        red: "#CB3434",
        yellow: "#CA9E00",
        green: "#289449",
        blue: "#076F99",
        magenta: "#6F357F"
      };

      Cup.addProperty('x', 'setShapeX');

      Cup.addProperty('y', 'setShapeY');

      Cup.addProperty('size', 'calc');

      Cup.addProperty('radius', 'draw');

      Cup.addProperty('color', 'draw');

      Cup.addProperty('darkenColor', 'draw');

      Cup.addProperty('shape', 'draw');

      Cup.prototype.shadow = new createjs.Shadow('#000', 0, 0, 5, 2);

      function Cup(cx, cy, size, model) {
        this.model = model;
        this.size = size;
        this.moving = null;
        this.shape = new createjs.Shape;
        this.shape.set({
          snapToPixel: true,
          x: this.x,
          y: this.y
        });
        this.shape.addEventListener('mousedown', (function(_this) {
          return function(event) {
            return _this.moving = {
              x: event.rawX,
              y: event.rawY
            };
          };
        })(this));
        this.shape.addEventListener('pressup', (function(_this) {
          return function(event) {
            if (!_this.moving) {
              return;
            }
            if (!_this.shifted(event.rawX, event.rawY)) {
              _this.model.trigger('click');
            }
            return _this.moving = null;
          };
        })(this));
        this.shape.addEventListener('pressmove', (function(_this) {
          return function(event) {
            var x, y;
            if (!_this.moving) {
              return;
            }
            if (_this.shifted(event.rawX, event.rawY)) {
              x = event.rawX - _this.moving.x;
              y = event.rawY - _this.moving.y;
              if (Math.abs(x) > Math.abs(y)) {
                x = Math.sign(x);
                y = 0;
              } else {
                x = 0;
                y = Math.sign(y);
              }
              _this.model.trigger('move', x, y);
              return _this.moving = null;
            }
          };
        })(this));
        this.model.on('change:selected', (function(_this) {
          return function() {
            return _this.draw();
          };
        })(this));
        this.model.on('change:col', (function(_this) {
          return function() {
            return _this.calc();
          };
        })(this));
        this.model.on('change:row', (function(_this) {
          return function() {
            return _this.calc();
          };
        })(this));
      }

      Cup.prototype.shifted = function(x, y) {
        var d;
        d = this.size * 0.2;
        return this.moving && (Math.abs(this.moving.x - x) > d || Math.abs(this.moving.y - y) > d);
      };

      Cup.prototype.calcX = function(col) {
        return col * this.size + this.size / 2;
      };

      Cup.prototype.calcY = function(row) {
        return row * this.size + this.size / 2;
      };

      Cup.prototype.calc = function() {
        this.cellX = this.model.col;
        this.cellY = this.model.row;
        this.x = this.calcX(this.cellX);
        this.y = this.calcY(this.cellY);
        this.radius = this.size * 0.7 / 2;
        this.color = this.colors[this.model.type];
        return this.darkenColor = this.darkenColors[this.model.type];
      };

      Cup.prototype.draw = function() {
        if (!this.shape) {
          return;
        }
        this.shape.graphics.clear();
        if (this.model.selected) {
          return this.shape.graphics.beginFill(this.darkenColor).drawCircle(0, 0, this.radius).beginFill(this.color).drawCircle(0, 0, this.radius * 0.70);
        } else {
          return this.shape.graphics.beginFill(this.color).drawCircle(0, 0, this.radius);
        }
      };

      Cup.prototype.setShapeX = function() {
        var ref;
        return (ref = this.shape) != null ? ref.x = this.x : void 0;
      };

      Cup.prototype.setShapeY = function() {
        var ref;
        return (ref = this.shape) != null ? ref.y = this.y : void 0;
      };

      Cup.prototype.move = function() {
        var cb, col, i, init, ref, ref1, row, sx, sy, x, y;
        col = arguments[0], row = arguments[1], init = 4 <= arguments.length ? slice.call(arguments, 2, i = arguments.length - 1) : (i = 2, []), cb = arguments[i++];
        x = this.calcX(row);
        y = this.calcY(col);
        if (init.length === 2) {
          ref = [this.calcX(init[0]), this.calcY(init[1])], sx = ref[0], sy = ref[1];
        } else {
          ref1 = [this.x, this.y], sx = ref1[0], sy = ref1[1];
        }
        return createjs.Tween.get(this.shape).set({
          x: sx,
          y: sy
        }).to({
          x: x,
          y: y
        }, this.anim.delay, this.anim.type).call(cb);
      };

      Cup.prototype.hide = function(cb) {
        return createjs.Tween.get(this.shape).to({
          scaleX: 0,
          scaleY: 0
        }, this.anim.delay, this.anim.type).call(cb);
      };

      Cup.prototype.show = function(cb) {
        return createjs.Tween.get(this.shape).to({
          scaleX: 1,
          scaleY: 1
        }, this.anim.delay, this.anim.type).call(cb);
      };

      return Cup;

    })(Module)
  });

}).call(this);

(function() {
  var CupsCounter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    ui: CupsCounter = (function(superClass) {
      extend(CupsCounter, superClass);

      CupsCounter.extend(PropertyMixin);

      CupsCounter.include(ViewMixin);

      CupsCounter.addProperty('score', 'scoreCallback');

      CupsCounter.addProperty('all', 'allCallback');

      CupsCounter.addProperty('done', 'doneCallback');

      CupsCounter.addProperty('visible', 'visibleCallback');

      CupsCounter.addProperty('model');

      CupsCounter.prototype.ui = {
        score: '.CupScore',
        all: '.All'
      };

      function CupsCounter(el, model) {
        this.setElement(el);
        this.name = this.$el.data('name');
        this.model = model;
      }

      CupsCounter.prototype.show = function() {
        return this.$el.show();
      };

      CupsCounter.prototype.hide = function() {
        return this.$el.hide();
      };

      CupsCounter.prototype.scoreCallback = function() {
        return this.ui.$score.text(this.score);
      };

      CupsCounter.prototype.allCallback = function() {
        return this.ui.$all.text(this.all);
      };

      CupsCounter.prototype.doneCallback = function() {
        return this.$el.toggleClass('done', this.done);
      };

      CupsCounter.prototype.visibleCallback = function() {
        if (this.visible) {
          return this.show();
        } else {
          return this.hide();
        }
      };

      CupsCounter.prototype.setModel = function(model) {
        var base, base1, key, ref, ref1, value;
        if (this._handlers == null) {
          this._handlers = {
            score: _.bind((function(value) {
              return this.score = value;
            }), this),
            all: _.bind((function(value) {
              return this.all = value;
            }), this),
            done: _.bind((function(value) {
              return this.done = value;
            }), this)
          };
        }
        if (this._model) {
          ref = this._handlers;
          for (key in ref) {
            value = ref[key];
            if (typeof (base = this._model).off === "function") {
              base.off("change:" + key, value);
            }
          }
        }
        this._model = model;
        if (!this._model) {
          this.all = 0;
          this.score = 0;
          this.done = false;
          this.visible = false;
          return this._model;
        }
        this.all = this._model.all;
        this.score = this._model.score;
        this.done = this._model.done;
        this.visible = true;
        ref1 = this._handlers;
        for (key in ref1) {
          value = ref1[key];
          if (typeof (base1 = this._model).on === "function") {
            base1.on("change:" + key, value);
          }
        }
        return this._model;
      };

      return CupsCounter;

    })(Module)
  });

}).call(this);

(function() {
  var CupsCounters,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    ui: CupsCounters = (function(superClass) {
      extend(CupsCounters, superClass);

      CupsCounters.extend(PropertyMixin);

      CupsCounters.include(ViewMixin);

      CupsCounters.addProperty('model');

      CupsCounters.prototype.ui = {
        counters: '.CupsCounter'
      };

      function CupsCounters(el, model) {
        this.setElement(el);
        this.counters = {};
        this.ui.$counters.each((function(_this) {
          return function(i, el) {
            var counter;
            counter = new ui.CupsCounter(el);
            return _this.counters[counter.name] = counter;
          };
        })(this));
        this.model = model;
      }

      CupsCounters.prototype.setModel = function(model) {
        var key, ref, ref1, results, value;
        this._model = model;
        if (!model) {
          return this._model;
        }
        ref = this._model.counters;
        results = [];
        for (key in ref) {
          value = ref[key];
          results.push((ref1 = this.counters[key]) != null ? ref1.model = value : void 0);
        }
        return results;
      };

      return CupsCounters;

    })(Module)
  });

}).call(this);

(function() {
  var Field,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  namespace({
    ui: Field = (function(superClass) {
      extend(Field, superClass);

      Field.include(ViewMixin);

      Field.prototype.ui = {
        score: '.Score',
        moves: '.Moves',
        counters: '.CupsCounters',
        canvas: '.Canvas'
      };

      function Field(game) {
        this.game = game;
        this.setUI();
        this.cupCounters = new ui.CupsCounters(this.ui.counters, this.game);
        this.moves = new ui.Counter(this.ui.moves, 'moves', this.game);
        this.score = new ui.Counter(this.ui.score, 'score', this.game);
        this.canvas = new ui.Canvas(this.ui.canvas, this.game);
        this.game.on('change:moves', (function(_this) {
          return function(moves) {
            return _this.ui.$moves.toggleClass('attention', moves <= 5);
          };
        })(this));
        this.game.on('change:win', (function(_this) {
          return function(win) {
            if (win) {
              alert('Win!');
              return window.location = window.location;
            }
          };
        })(this));
        this.game.on('change:fail', (function(_this) {
          return function(fail) {
            if (fail) {
              alert('Fail!');
              return window.location = window.location;
            }
          };
        })(this));
      }

      return Field;

    })(Module)
  });

}).call(this);

(function() {
  $((function(_this) {
    return function() {
      return _this.field = new ui.Field(new models.Game({
        width: 5,
        height: 5,
        moves: 30,
        types: ['red', 'green', 'blue', 'yellow'],
        targets: {
          red: 50,
          green: 50,
          blue: 50
        }
      }));
    };
  })(this));

}).call(this);
