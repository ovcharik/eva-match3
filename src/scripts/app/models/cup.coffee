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
