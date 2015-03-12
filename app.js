(function() {
  var Counter, CupsCounter, CupsCounters, Field, PropertyMixin, moduleKeywords,
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
        if (cb.apply(this, args) === false) {
          return;
        }
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
    }
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
    ui: Counter = (function(superClass) {
      extend(Counter, superClass);

      Counter.extend(PropertyMixin);

      Counter.include(ViewMixin);

      Counter.property('value', {
        get: function() {
          return this._value;
        },
        set: function(value) {
          return this.setValue(value);
        }
      });

      Counter.property('model', {
        get: function() {
          return this._model;
        },
        set: function(value) {
          return this.setModel(value);
        }
      });

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

      CupsCounter.prototype.ui = {
        score: '.CupScore',
        all: '.All'
      };

      CupsCounter.property('score', {
        get: function() {
          return this._score;
        },
        set: function(value) {
          return this.setScore(value);
        }
      });

      CupsCounter.property('all', {
        get: function() {
          return this._all;
        },
        set: function(value) {
          return this.setAll(value);
        }
      });

      CupsCounter.property('visible', {
        get: function() {
          return this._visible;
        },
        set: function(value) {
          return this.setVisible(value);
        }
      });

      CupsCounter.property('model', {
        get: function() {
          return this._model;
        },
        set: function(value) {
          return this.setModel(value);
        }
      });

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

      CupsCounter.prototype.setScore = function(value) {
        this._score = Number(value);
        this.ui.$score.text(this._score);
        return this._score;
      };

      CupsCounter.prototype.setAll = function(value) {
        this._all = Number(value);
        this.ui.$all.text(this._all);
        return this._all;
      };

      CupsCounter.prototype.setVisible = function(value) {
        this._visible = Boolean(value);
        if (this._visible) {
          this.show();
        } else {
          this.hide();
        }
        return this._visible;
      };

      CupsCounter.prototype.setModel = function(model) {
        var base, base1, key, ref, ref1, value;
        if (this._handlers == null) {
          this._handlers = {
            score: _.bind(this.setScore, this),
            all: _.bind(this.setAll, this),
            visible: _.bind(this.setVisible, this)
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
          this.visible = false;
          return this._model;
        }
        this.all = this._model.all;
        this.score = this._model.all;
        this.visible = this._model.all;
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

      CupsCounters.prototype.ui = {
        counters: '.CupsCounter'
      };

      CupsCounters.property('model', {
        get: function() {
          return this._model;
        },
        set: function(value) {
          return this.setModel(value);
        }
      });

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

      function Field(model) {
        this.setUI();
        this.cupCounters = new ui.CupsCounters(this.ui.counters, model);
        this.moves = new ui.Counter(this.ui.moves, 'moves', model);
        this.score = new ui.Counter(this.ui.score, 'score', model);
      }

      return Field;

    })(Module)
  });

  $(function() {
    window.field = new ui.Field;
    return console.log(field);
  });

}).call(this);

//# sourceMappingURL=app.js.map
