namespace models:
  class CupsCounter extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'all'
    @addProperty 'score'

    constructor: (@name, all) ->
      @all = all
      @score = 0
