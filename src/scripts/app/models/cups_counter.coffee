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

