namespace models:
  class Grid extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'lock'

    constructor: (model) ->
      @model = model
      @init()

    init: ->
      @empty()
      for v, row in @grid
        for v, col in @grid[row]
          @grid[row][col] = @newCup(row, col)
      @trigger 'change'

    empty: ->
      @grid = new Array(@model.height)
      for value, index in @grid
        @grid[index] = new Array(@model.width)

    randomType: ->
      @model.types[ Math.random() * @model.types.length | 0 ]

    newCup: (row, col) ->
      cup = new models.Cup(row, col, @randomType())
      cup.on 'click',  => @onCupClick(cup)
      cup

    eachCups: (cb) ->
      for row, y in @grid
        for cup, x in row
          cb?(cup, x, y)

    onCupClick: (cup) ->
      return if @lock
      if @selected
        if @isNear(@selected, cup)
          @swap(@selected, cup)
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

    isNear: (c1, c2) ->
      (c1.row == c2.row && Math.abs(c1.col - c2.col) == 1) ||
      (c1.col == c2.col && Math.abs(c1.row - c2.row) == 1)

    isRight : (c1, c2) -> c1 > c2
    isLeft  : (c1, c2) -> c1 < c2
    isTop   : (r1, r2) -> r1 < r2
    isBottom: (r1, r2) -> r1 > r2

    hasMatches: ->
      Boolean(Math.random() * 2 | 0)

    swap: (c1, c2) ->
      animHandlers = -> [
        _.bind c1.view.move, c1.view, c2.row, c2.col #TODO
        _.bind c2.view.move, c2.view, c1.row, c1.col #TODO
      ]

      @startSwap c1, c2
      async.parallel animHandlers(), =>
        @doSwap c1, c2
        unless @hasMatches()
          async.parallel animHandlers(), =>
            @doSwap  c1, c2
            @endSwap c1, c2
        else
          @endSwap c1, c2

    startSwap: (c1, c2) ->
      @lock = true
      c1.selected = true
      c2.selected = true

    endSwap: (c1, c2) ->
      c1.selected = false
      c2.selected = false
      @lock = false

    doSwap: (c1, c2) ->
      @grid[c1.row][c1.col] = c2
      @grid[c2.row][c2.col] = c1
      [r, c] = [c2.row, c2.col]
      [c2.row, c2.col] = [c1.row, c1.col]
      [c1.row, c1.col] = [r, c]
      @trigger 'change'
