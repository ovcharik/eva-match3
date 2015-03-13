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
    unless name
      delete @__eventHandlers if @__eventHandlers?
      return
    unless callback
      @_setHandlers(name, [])
    else
      @_setHandlers name, @_getHandlers(name).filter (c) ->
        c == callback
    return

  trigger: (name, args...) ->
    for cb in @_getHandlers(name)
      cb.apply(@, args)
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

  addProperty: (name, cbs...) ->
    @property name,
      get: -> @["_#{name}"]
      set: (value) ->
        n = "set#{name.capitalize()}"
        if @[n]?
          r = @[n](value)
        else
          r = @setProp(name, value)
        for cb in cbs
          @[cb]?()
        r

  extended: ->
    @::setProp = (name, value) ->
      if @["_#{name}"] != value
        @["_#{name}"] = value
        @trigger? "change:#{name}", @["_#{name}"]
      @["_#{name}"]

String::capitalize = ->
  @charAt(0).toUpperCase() + @slice(1)

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

namespace models:
  class Cup extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'row'
    @addProperty 'col'
    @addProperty 'type'
    @addProperty 'selected'

    constructor: (row, col, type) ->
      @row = row
      @col = col
      @type = type
      @selected = false

namespace models:
  class CupsCounter extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'all',   'checkDone'
    @addProperty 'score', 'checkDone'
    @addProperty 'done'

    constructor: (@name, all) ->
      @all = all
      @score = 0

    checkDone: ->
      @done = @all <= @score

namespace models:
  class Game extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'score'
    @addProperty 'moves', 'checkFail'
    @addProperty 'width'
    @addProperty 'height'
    @addProperty 'types'
    @addProperty 'win'
    @addProperty 'fail'
    @addProperty 'lock'

    constructor: (options) ->
      @checkWinHandler  = _.bind @checkWin, @

      @setOptions(options)
      @reset()

      @grid = new models.Grid(@)
      @grid.on 'change', => @trigger 'change:grid'
      @grid.on 'change:lock', (value) => @lock = value

    reset: ->
      @score = 0
      @win = false
      @fail = false
      @lock = false

    setOptions: (options) ->
      @height = options.height
      @width  = options.width

      @moves = options.moves
      @types = options.types

      @setTargets options.targets

    setTargets: (targets) ->
      if @targets
        value.off('change:done', @checkWinHandler) for key, value of @targets
      @counters = @targets = {}
      for key, value of targets
        @targets[key] = new models.CupsCounter key, value
        @targets[key].on? 'change:done', @checkWinHandler

    checkWin: ->
      w = true
      for key, value of @targets
        w &&= value.done
      @win = w

    checkFail: ->
      @fail = @fail || @moves <= 0

namespace models:
  class Grid extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'lock'
    @addProperty 'height'
    @addProperty 'width'
    @addProperty 'types'

    constructor: (model) ->
      @model = model
      @width  = @model.width
      @height = @model.height
      @types = @model.types
      @on 'change', _.bind @onChange, @
      @init()


    ###############
    # grid methods

    init: ->
      @empty()
      for v, row in @grid
        for v, col in @grid[row]
          @grid[row][col] = @newCup(row, col)
      @trigger 'change'

    empty: ->
      @grid = new Array(@height)
      for value, index in @grid
        @grid[index] = new Array(@width)

    normalizeGrid: ->
      @eachCups (cup, x, y) =>
        cup.col = x
        cup.row = y

    hasEmpty: ->
      r = false
      for row in @grid when not r
        for cup in row when not r
          r ||= not cup?
      r

    fillCol: (col) ->
      offset = 0
      for row, y in @grid
        tmp = y
        while not row[col]
          tmp += 1
          row[col] = @getCup(col, tmp)
        # FIXME
        if row[col].row >= @height
          offset += 1
          row[col].row += offset - 1
          console.log row[col].row, offset


    getCup: (x, y) ->
      if y < 0 || y >= @height || x < 0 || x >= @width
        @newCup y, x
      else
        c = @grid[y][x]
        @grid[y][x] = null
        c

    hasMatches: ->
      Boolean(Math.random() * 2 | 0)

    eachCups: (cb) ->
      for row, y in @grid
        for cup, x in row
          cb?(cup, x, y) if cup


    ################
    # grid handlers

    onChange: ->
      if @hasEmpty()
        @fillEmpty()
        return


    ##############
    # cup methods

    newCup: (row, col) ->
      cup = new models.Cup(row, col, @randomType())
      cup.on 'click',    => return if @lock; @onCupClick(cup)
      cup.on 'dblclick', => return if @lock; @onCupDblClick(cup)
      cup

    removeCup: (cup) ->
      @selected = null if @selected == cup
      row = cup.row
      col = cup.col
      cup.off()
      @grid[row][col] = null

    randomType: ->
      @types[ Math.random() * @types.length | 0 ]

    isNear: (c1, c2) ->
      (c1.row == c2.row && Math.abs(c1.col - c2.col) == 1) ||
      (c1.col == c2.col && Math.abs(c1.row - c2.row) == 1)


    ################
    ## cup handlers

    onCupClick: (cup) ->
      if @selected
        if @isNear(@selected, cup)
          @trySwap(@selected, cup)
          @selected = null
        else
          cup.selected = !cup.selected
          if cup != @selected
            @selected.selected = false
            @selected = cup
          else
            @selected = null
      else
        cup.selected = !cup.selected
        @selected = cup

    onCupDblClick: (cup) ->
      @removeCups [cup]


    ##################
    # animate methods

    trySwap: (c1, c2) ->
      startSwap = =>
        c1.selected = true
        c2.selected = true

      endSwap = =>
        c1.selected = false
        c2.selected = false

      doSwap = =>
        @grid[c1.row][c1.col] = c2
        @grid[c2.row][c2.col] = c1
        [r, c] = [c2.row, c2.col]
        [c2.row, c2.col] = [c1.row, c1.col]
        [c1.row, c1.col] = [r, c]

      animHandlers = => [
        _.bind c1.view.move, c1.view, c2.row, c2.col #TODO
        _.bind c2.view.move, c2.view, c1.row, c1.col #TODO
      ]

      startSwap()
      @lockAndExec animHandlers(), =>
        doSwap()
        unless @hasMatches()
          @lockAndExec animHandlers(), =>
            doSwap()
            endSwap()
        else
          endSwap()
          @trigger 'change'

    fillEmpty: ->
      for col in [0..@width - 1]
        @fillCol col

      @trigger 'change'

      anims = []
      @eachCups (cup, x, y) =>
        if cup.row != y
          anims.push _.bind cup.view.move, cup.view, y, x

      @lockAndExec anims, =>
        @normalizeGrid()
        @trigger 'change'

    removeCups: (cups) ->
      anims = []
      for cup in cups
        anims.push _.bind(cup.view.hide, cup.view)

      @lockAndExec anims, =>
        @removeCup cup for cup in cups
        @trigger 'change'


    ##########
    # helpers

    lockAndExec: (h = [], c) ->
      @lock = true
      if h.length > 0
        async.parallel h, =>
          c?()
          @lock = false
      else
        c?()
        @lock = false

namespace ui:
  class Canvas extends Module
    @extend PropertyMixin
    @include ViewMixin
    @include EventMixin

    @addProperty 'model'
    @addProperty 'cellSize'

    @property 'width',
      get: -> @el.width
      set: (val) -> @el.width = val

    @property 'height',
      get: -> @el.height
      set: (val) -> @el.height = val

    @property 'handlers', get: -> @_handlers ?=
      onTick: _.bind @tick, @
      onUpdateGrid: _.bind @updateGrid, @

    constructor: (el, model) ->
      @setElement el
      @model = model

      @stage = new createjs.Stage(@el)
      @resetSize()
      @initHandlers()

      @updateGrid()

    initHandlers: ->
      createjs.Ticker.addEventListener 'tick', @handlers.onTick

      @model.on 'change:grid', @handlers.onUpdateGrid

    resetSize: ->
      @width  = @$el.width()
      @height = @$el.height()

      cw = @width  / (@model.width)
      ch = @height / (@model.height)
      cs = if cw < ch then cw else ch

      w = cs * @model.width
      h = cs * @model.height

      @stage.set
        regX: (w - @width)  / 2
        regY: (h - @height) / 2

      @cellSize  = cs

    updateGrid: ->
      @model.grid.eachCups (cup, x, y) =>
        cup.view ?= new ui.Cup(x, y, @cellSize, cup)
        @stage.addChild cup.view.shape

    tick: (event) ->
      @stage.update event

namespace ui:

  class Counter extends Module
    @extend PropertyMixin
    @include ViewMixin

    @addProperty 'value'
    @addProperty 'model'

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
  class Cup extends Module
    @extend PropertyMixin
    @include EventMixin

    anim:
      delay: 400
      type: createjs.Ease.circInOut

    colors:
      red     : "#F15A5A"
      yellow  : "#F0C419"
      green   : "#4EBA6F"
      blue    : "#2D95BF"
      magenta : "#955BA5"

    darkenColors:
      red     : "#CB3434"
      yellow  : "#CA9E00"
      green   : "#289449"
      blue    : "#076F99"
      magenta : "#6F357F"

    @addProperty 'x', 'setShapeX'
    @addProperty 'y', 'setShapeY'
    @addProperty 'size', 'calc'
    @addProperty 'radius', 'draw'
    @addProperty 'color', 'draw'
    @addProperty 'darkenColor', 'draw'
    @addProperty 'shape', 'draw'

    shadow: new createjs.Shadow('#000', 0, 0, 5, 2)

    constructor: (cx, cy, size, model) ->
      @model = model
      @size = size

      @shape = new createjs.Shape
      @shape.set
        snapToPixel: true
        x: @x
        y: @y

      @shape.addEventListener 'click',    => @model.trigger 'click'
      @shape.addEventListener 'dblclick', => @model.trigger 'dblclick'

      @model.on 'change:selected', => @draw()
      @model.on 'change:col', => @calc()
      @model.on 'change:row', => @calc()

    calcX: (col) -> col * @size + @size / 2
    calcY: (row) -> row * @size + @size / 2

    calc: ->
      @cellX = @model.col
      @cellY = @model.row
      @x = @calcX @cellX
      @y = @calcY @cellY
      @radius = @size * 0.7 / 2
      @color = @colors[@model.type]
      @darkenColor = @darkenColors[@model.type]

    draw: ->
      return unless @shape
      @shape.graphics.clear()
      if @model.selected
        @shape.graphics
          .beginFill(@darkenColor)
          .drawCircle(0, 0, @radius)
          .beginFill(@color)
          .drawCircle(0, 0, @radius * 0.70)
      else
        @shape.graphics
          .beginFill(@color)
          .drawCircle(0, 0, @radius)

    setShapeX: ->
      @shape?.x = @x

    setShapeY: ->
      @shape?.y = @y

    move: (col, row, init..., cb) ->
      x = @calcX row
      y = @calcY col
      if init.length == 2
        [sx, sy] = [@calcX(init[0]), @calcY(init[1])]
      else
        [sx, sy] = [@x, @y]
      createjs.Tween.get @shape
        .set { x: sx, y: sy }
        .to { x: x, y: y }, @anim.delay, @anim.type
        .call cb

    hide: (cb) ->
      createjs.Tween.get @shape
        .to {scaleX: 0, scaleY: 0}, @anim.delay, @anim.type
        .call cb

    show: (cb) ->
      createjs.Tween.get @shape
        .to {scaleX: 1, scaleY: 1}, @anim.delay, @anim.type
        .call cb

namespace ui:

  class CupsCounter extends Module
    @extend PropertyMixin
    @include ViewMixin

    @addProperty 'score',   'scoreCallback'
    @addProperty 'all',     'allCallback'
    @addProperty 'done',    'doneCallback'
    @addProperty 'visible', 'visibleCallback'
    @addProperty 'model'

    ui:
      score: '.CupScore'
      all: '.All'

    constructor: (el, model) ->
      @setElement el
      @name = @$el.data('name')
      @model = model

    show: ->
      @$el.show()

    hide: ->
      @$el.hide()

    scoreCallback: ->
      @ui.$score.text @score

    allCallback: ->
      @ui.$all.text @all

    doneCallback: ->
      @$el.toggleClass('done', @done)

    visibleCallback: ->
      if @visible
        @show()
      else
        @hide()

    setModel: (model) ->
      @_handlers ?=
        score:   _.bind ((value) -> @score = value), @
        all:     _.bind ((value) -> @all   = value), @
        done:    _.bind ((value) -> @done  = value), @

      # unbind
      if @_model
        for key, value of @_handlers
          @_model.off? "change:#{key}", value

      @_model = model
      unless @_model
        @all     = 0
        @score   = 0
        @done    = false
        @visible = false
        return @_model

      @all     = @_model.all
      @score   = @_model.score
      @done    = @_model.done
      @visible = true

      # bind
      for key, value of @_handlers
        @_model.on? "change:#{key}", value

      @_model

namespace ui:

  class CupsCounters extends Module
    @extend PropertyMixin
    @include ViewMixin

    @addProperty 'model'

    ui:
      counters: '.CupsCounter'

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

    constructor: (@game) ->
      @setUI()

      @cupCounters = new ui.CupsCounters(@ui.counters, @game)
      @moves = new ui.Counter(@ui.moves, 'moves', @game)
      @score = new ui.Counter(@ui.score, 'score', @game)
      @canvas = new ui.Canvas(@ui.canvas, @game)

      @game.on 'change:moves', (moves) =>
        @ui.$moves.toggleClass('attention', moves <= 5)

      @game.on 'change:win', (win) =>
        if win
          alert('Win!')
          window.location = window.location

      @game.on 'change:fail', (fail) =>
        if fail
          alert('Fail!')
          window.location = window.location

$ =>

  @field = new ui.Field new models.Game
    width:  6
    height: 6

    moves: 40
    types: ['red', 'green', 'blue', 'yellow']

    targets:
      red:   10
      green: 10
      blue:  10
