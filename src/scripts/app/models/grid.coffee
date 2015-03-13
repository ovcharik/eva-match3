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

    randomType: ->
      @types[ Math.random() * @types.length | 0 ]

    newCup: (row, col) ->
      cup = new models.Cup(row, col, @randomType())
      cup.on 'click', => @onCupClick(cup)
      cup.on 'dblclick', => @onCupDblClick(cup)
      cup

    eachCups: (cb) ->
      for row, y in @grid
        for cup, x in row
          cb?(cup, x, y) if cup

    removeCup: (cup) ->
      row = cup.row
      col = cup.col
      cup.off()
      @grid[row][col] = null

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

    onCupDblClick: (cup) ->
      return if @lock
      @lock = true
      cup.view.hide =>
        @removeCup cup
        @lock = false
        @trigger 'change'

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
          @trigger 'change'

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

    hasEmpty: ->
      r = false
      for row in @grid when not r
        for cup in row when not r
          r ||= not cup?
      r

    getCup: (x, y) ->
      if y < 0 || y >= @height || x < 0 || x >= @width
        @newCup y, x
      else
        c = @grid[y][x]
        @grid[y][x] = null
        c

    normalizeGrid: ->
      @eachCups (cup, x, y) =>
        cup.col = x
        cup.row = y

    fillCol: (col) ->
      for row, y in @grid
        tmp = y
        while not row[col]
          tmp += 1
          row[col] = @getCup(col, tmp)

    fillEmpty: ->
      @lock = true
      for col in [0..@width - 1]
        @fillCol col

      @trigger 'change'

      anims = []
      @eachCups (cup, x, y) =>
        if cup.row != y
          anims.push _.bind cup.view.move, cup.view, y, x

      async.parallel anims, =>
        @normalizeGrid()
        @lock = false
        @trigger 'change'

    onChange: ->
      if @hasEmpty()
        @fillEmpty()
        return
