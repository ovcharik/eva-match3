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

      cw = @width  / @model.width
      ch = @height / @model.height
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

    # setModel: (model) ->
