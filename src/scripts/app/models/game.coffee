namespace models:
  class Game extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'score'
    @addProperty 'moves'
    @addProperty 'width'
    @addProperty 'height'
    @addProperty 'types'

    constructor: (options) ->
      @setOptions(options)
      @reset()

    reset: ->
      @score = 0

    setOptions: (options) ->
      @height = options.height
      @width  = options.width

      @moves = options.moves
      @types = options.types

      @setTargets options.targets

    setTargets: (targets) ->
      @counters = {}
      for key, value of targets
        @counters[key] = new models.CupsCounter key, value

