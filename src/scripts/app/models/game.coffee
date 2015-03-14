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

    constructor: (options) ->
      @checkWinHandler  = _.bind @checkWin, @

      @setOptions(options)

    reset: ->
      @score = 0
      @win = false
      @fail = false

    setOptions: (options) ->
      @reset()

      @height = options.height
      @width  = options.width

      @moves = options.moves
      @types = options.types

      @setTargets options.targets
      @setGrid()

    setTargets: (targets) ->
      if @targets
        value.off('change:done', @checkWinHandler) for key, value of @targets
      @counters = @targets = {}
      for key, value of targets
        @targets[key] = new models.CupsCounter key, value
        @targets[key].on? 'change:done', @checkWinHandler

    setGrid: ->
      if @grid
        @grid.off()

      @grid = new models.Grid(@)
      @grid.on 'change', => @trigger 'change:grid'
      @grid.on 'swap', => @moves -= 1
      @grid.on 'matches', (score, types) =>
        @updateTarget(types)
        @updateScore(score)

    updateTarget: (types) ->
      for key, value of types
        @targets[key]?.score += value

    updateScore: (score) ->
      @score += _.chain(score).map((s) -> (s - 1) * 5).reduce(((memo, v) -> memo + v), 0).value()

    checkWin: ->
      w = true
      for key, value of @targets
        w &&= value.done
      @win = w

    checkFail: ->
      @fail = @fail || @moves <= 0
