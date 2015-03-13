namespace models:
  class Grid extends Module
    @extend PropertyMixin
    @include EventMixin

    constructor: (model) ->
      @model = model
      @init()

    init: ->
      @empty()
      for v, row in @grid
        for v, col in @grid[row]
          @grid[row][col] = @newCup()
      @trigger 'change'

    empty: ->
      @grid = new Array(@model.height)
      for value, index in @grid
        @grid[index] = new Array(@model.width)

    randomType: ->
      @model.types[ Math.random() * @model.types.length | 0 ]

    newCup: ->
      new models.Cup(@randomType())

    eachCups: (cb) ->
      for row, y in @grid
        for cup, x in row
          cb?(cup, x, y)
