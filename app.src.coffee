@EventMixin =
  _eventHandlers: ->
    @__eventHandlers ||= {}

  _getHandlers: (name) ->
    @_eventHandlers()[name] ||= []
    return @_eventHandlers()[name]

  _setHandlers: (name, value) ->
    @_eventHandlers()[name] ||= value
    return

  on: (name, callback) ->
    return unless callback
    @_getHandlers(name).push callback

  off: (name, callback) ->
    unless callback
      @_setHandlers(name, [])
    else
      @_setHandlers name, @_getHandlers(name).filter (c) ->
        c == callback
    return

  trigger: (name, args...) ->
    for cb in @_getHandlers(name)
      return if cb.apply(@, args) == false
    return

moduleKeywords = ['extended', 'included']

class @Module
  @extend: (obj) ->
    for key, value of obj when key not in moduleKeywords
      @[key] = value

    obj.extended?.apply(@)
    this

  @include: (obj) ->
    for key, value of obj when key not in moduleKeywords
      # Assign properties to the prototype
      @::[key] = value

    obj.included?.apply(@)
    this

###
# Elegant pattern to simulate namespace in CoffeeScript
#
# @author Maks
###

do (root = global ? window) ->
  
  fn = ->

    args   = arguments[0]
    target = root

    loop
      for subpackage, obj of args
        target = target[subpackage] or= {}
        args   = obj
      break unless typeof args is 'object'

    Class        = args
    target       = root if arguments[0].hasOwnProperty 'global'
    name         = Class.toString().match(/^function\s(\w+)\(/)[1]
    target[name] = Class

  # Aliases
  root.namespace = fn
  root.module    = fn

PropertyMixin =
  property: (prop, options) ->
    Object.defineProperty @prototype, prop, options

@ViewMixin =
  $: (args...) ->
    if @$el
      $.apply($, args.concat([@$el]))
    else
      $.apply($, args)

  setElement: (el) ->
    @$el = $(el)
    @el = @$el[0]
    @setUI()

  setUI: ->
    @ui = {}
    for key, value of @constructor.prototype.ui
      tmp = @ui["$#{key}"] = @$(value)
      @ui[key] = tmp[0]

namespace ui:

  class Counter extends Module
    @extend PropertyMixin
    @include ViewMixin

    @property 'value',
      get: -> @_value
      set: (value) -> @setValue(value)

    @property 'model',
      get: -> @_model
      set: (value) -> @setModel(value)

    constructor: (el, @prop, model) ->
      @setElement el
      @model = model

    setValue: (value) ->
      @_value = Number(value)
      @$el.text @_value
      @_value

    setModel: (model) ->
      @_handler ?= _.bind @setValue, @
      if @_model
        @_model.off? "change:#{@prop}", @_handler
      @_model = model
      unless @_model
        @value = 0
        return @_model
      @value = @_model[@prop]
      @_model.on? "change:#{@prop}", @_handler
      @_model


namespace ui:

  class CupsCounter extends Module
    @extend PropertyMixin
    @include ViewMixin

    ui:
      score: '.CupScore'
      all: '.All'

    @property 'score',
      get: -> @_score
      set: (value) -> @setScore(value)

    @property 'all',
      get: -> @_all
      set: (value) -> @setAll(value)

    @property 'visible',
      get: -> @_visible
      set: (value) -> @setVisible(value)

    @property 'model',
      get: -> @_model
      set: (value) -> @setModel(value)

    constructor: (el, model) ->
      @setElement el
      @name = @$el.data('name')
      @model = model

    show: ->
      @$el.show()

    hide: ->
      @$el.hide()

    setScore: (value) ->
      @_score = Number(value)
      @ui.$score.text @_score
      @_score

    setAll: (value) ->
      @_all = Number(value)
      @ui.$all.text @_all
      @_all

    setVisible: (value) ->
      @_visible = Boolean(value)
      if @_visible
        @show()
      else
        @hide()
      @_visible

    setModel: (model) ->
      @_handlers ?=
        score:   _.bind @setScore, @
        all:     _.bind @setAll, @
        visible: _.bind @setVisible, @

      # unbind
      if @_model
        for key, value of @_handlers
          @_model.off? "change:#{key}", value

      @_model = model
      unless @_model
        @all     = 0
        @score   = 0
        @visible = false
        return @_model

      @all     = @_model.all
      @score   = @_model.all
      @visible = @_model.all

      # bind
      for key, value of @_handlers
        @_model.on? "change:#{key}", value

      @_model

namespace ui:

  class CupsCounters extends Module
    @extend PropertyMixin
    @include ViewMixin

    ui:
      counters: '.CupsCounter'

    @property 'model',
      get: -> @_model
      set: (value) -> @setModel(value)

    constructor: (el, model) ->
      @setElement el

      @counters = {}
      @ui.$counters.each (i, el) =>
        counter = new ui.CupsCounter(el)
        @counters[counter.name] = counter

      @model = model

    setModel: (model) ->
      @_model = model
      return @_model unless model

      for key, value of @_model.counters
        @counters[key]?.model = value


namespace ui:

  class Field extends Module
    @include ViewMixin

    ui:
      score:    '.Score'
      moves:    '.Moves'
      counters: '.CupsCounters'
      canvas:   '.Canvas'

    constructor: (model) ->
      @setUI()

      @cupCounters = new ui.CupsCounters(@ui.counters, model)
      @moves = new ui.Counter(@ui.moves, 'moves', model)
      @score = new ui.Counter(@ui.score, 'score', model)

$ ->
  window.field = new ui.Field
  console.log field