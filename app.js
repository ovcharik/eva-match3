(function() {
  var Counter, CupsCounter, CupsCounters, Field, Game, PropertyMixin, moduleKeywords,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

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
      if (!callback) {
        this._setHandlers(name, []);
      } else {
        this._setHandlers(name, this._getHandlers(name).filter(function(c) {
          return c === callback;
        }));
      }
    },
    trigger: function() {
      var args, cb, j, len, name, ref;
      name = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      ref = this._getHandlers(name);
      for (j = 0, len = ref.length; j < len; j++) {
        cb = ref[j];
        cb.apply(this, args);
      }
    }
  };

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


  /*
   * Elegant pattern to simulate namespace in CoffeeScript
  #
   * @author Maks
   */

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

  PropertyMixin = {
    property: function(prop, options) {
      return Object.defineProperty(this.prototype, prop, options);
    },
    addProperty: function(name, setCallback) {
      return this.property(name, {
        get: function() {
          return this["_" + name];
        },
        set: function(value) {
          var n, r;
          n = "set" + (name.capitalize());
          if (this[n] != null) {
            r = this[n](value);
          } else {
            r = this.setProp(name, value);
          }
          if (setCallback) {
            if (typeof this[setCallback] === "function") {
              this[setCallback]();
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

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

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

  namespace({
    models: CupsCounter = (function(superClass) {
      extend(CupsCounter, superClass);

      CupsCounter.extend(PropertyMixin);

      CupsCounter.include(EventMixin);

      CupsCounter.addProperty('all', 'checkDone');

      CupsCounter.addProperty('score', 'checkDone');

      CupsCounter.addProperty('done');

      function CupsCounter(name1, all) {
        this.name = name1;
        this.all = all;
        this.score = 0;
      }

      CupsCounter.prototype.checkDone = function() {
        return this.done = this.all <= this.score;
      };

      return CupsCounter;

    })(Module)
  });

  namespace({
    models: Game = (function(superClass) {
      extend(Game, superClass);

      Game.extend(PropertyMixin);

      Game.include(EventMixin);

      Game.addProperty('score');

      Game.addProperty('moves');

      Game.addProperty('width');

      Game.addProperty('height');

      Game.addProperty('types');

      Game.addProperty('win');

      function Game(options) {
        this.checkWinHandler = _.bind(this.checkWin, this);
        this.setOptions(options);
        this.reset();
      }

      Game.prototype.reset = function() {
        this.score = 0;
        return this.win = false;
      };

      Game.prototype.setOptions = function(options) {
        this.height = options.height;
        this.width = options.width;
        this.moves = options.moves;
        this.types = options.types;
        return this.setTargets(options.targets);
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

      return Game;

    })(Module)
  });

  namespace({
    ui: Counter = (function(superClass) {
      extend(Counter, superClass);

      Counter.extend(PropertyMixin);

      Counter.include(ViewMixin);

      Counter.addProperty('value');

      Counter.addProperty('model');

      function Counter(el, prop1, model) {
        this.prop = prop1;
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
      }

      return Field;

    })(Module)
  });

  $(function() {
    var config;
    config = {
      width: 6,
      height: 6,
      moves: 40,
      types: ['red', 'green', 'blue', 'yellow'],
      targets: {
        red: 10,
        green: 10,
        blue: 10
      }
    };
    return window.field = new ui.Field(new models.Game(config));
  });

}).call(this);

//# sourceMappingURL=app.js.map
