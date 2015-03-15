namespace models:
  class Grid extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'lock'
    @addProperty 'height'
    @addProperty 'width'
    @addProperty 'types'

    constructor: (model) ->
      @lock = 0
      @model = model
      @width  = @model.width
      @height = @model.height
      @types = @model.types
      @swaped = false

      @on 'change', _.bind @onChange, @
      @on 'change:lock', _.bind @onChangeLock, @

      @init()


    ###############
    # grid methods

    init: ->
      @empty()
      while true
        for v, row in @grid
          for v, col in @grid[row]
            @grid[row][col] = @newCup(row, col)
        continue if @findMatches().length
        continue unless @hasPossible()
        break
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

    getCup: (x, y) ->
      if y < 0 || y >= @height || x < 0 || x >= @width
        @newCup y, x
      else
        c = @grid[y][x]
        @grid[y][x] = null
        c

    findVMatch: (row, col) ->
      matches = [@grid[row][col]]
      for c in [col .. @width - 2]
        if @grid[row][c].type == @grid[row][c + 1].type
          matches.push @grid[row][c + 1]
        else
          return matches
      matches

    findHMatch: (row, col) ->
      matches = [@grid[row][col]]
      for r in [row .. @height - 2]
        if @grid[r][col].type == @grid[r + 1][col].type
          matches.push @grid[r + 1][col]
        else
          return matches
      matches

    findMatches: ->
      matches = []
      row = 0; while row < @height
        col = 0; while col < @width - 2
          m = @findVMatch(row, col)
          if m.length > 2
            matches.push m
          col += m.length
        row += 1
      col = 0; while col < @width
        row = 0; while row < @height - 2
          m = @findHMatch(row, col)
          if m.length > 2
            matches.push m
          row += m.length
        col += 1
      matches

    findAndRemoveMatches: ->
      matches = @findMatches()
      cups = _.chain(matches).flatten().uniq().value()

      types = _.countBy cups, (c) -> c.type
      score = _.map matches, (m) -> m.length

      @trigger 'matches', score, types

      @removeCups cups if cups.length
      return Boolean cups.length

    matchType: (col, row, type) ->
      if col < 0 || col >= @width || row < 0 || row >= @height
        return false
      @grid[row][col].type == type

    matchPattern: (col, row, mustHave, needOne) ->
      type = @grid[row][col].type
      for m in mustHave
        unless @matchType col + m[0], row + m[1], type
          return false
      for n in needOne
        if @matchType col + n[0], row + n[1], type
          return true
      return false

    hasPossible: ->
      patterns =
        hNear: [[[1,0]], [[-2,0],[-1,-1],[-1,1],[2,-1],[2,1],[3,0]]]
        vNear: [[[0,1]], [[0,-2],[-1,-1],[1,-1],[-1,2],[1,2],[0,3]]]
        h:     [[[2,0]], [[1,-1],[1,1]]]
        v:     [[[0,2]], [[-1,1],[1,1]]]
      for row, y in @grid
        for cup, x in row
          for name, pattern of patterns
            return true if @matchPattern x, y, pattern[0], pattern[1]
      return false

    eachCups: (cb) ->
      for row, y in @grid
        for cup, x in row
          cb?(cup, x, y) if cup

    getCupOrNull: (col, row) ->
      if col < 0 || col >= @width || row < 0 || row >= @height
        return null
      return @grid[row][col]


    ################
    # grid handlers

    onChange: ->
      if @hasEmpty()
        @fillEmpty()
        return

    onChangeLock: ->
      if not @lock and @swaped
        @trigger 'swap'
        @swaped = false


    ##############
    # cup methods

    newCup: (row, col) ->
      cup = new models.Cup(row, col, @randomType())
      cup.on 'click', => return if @lock; @onCupClick(cup)
      cup.on 'move', (x, y) => return if @lock; @onCupMove(cup, x, y)
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

    onCupMove: (cup, x, y) ->
      c1 = cup
      c2 = @getCupOrNull(c1.col + x, c1.row + y)
      if c1 and c2
        if @selected
          @selected.selected = false
          @selected = null
        @trySwap(c1, c2)


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
        unless @findAndRemoveMatches()
          @lockAndExec animHandlers(), =>
            doSwap()
            endSwap()
        else
          @swaped = true
          endSwap()

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
        unless @findAndRemoveMatches()
          unless @hasPossible()
            @shuffle()

    canShuffle: ->
      _.chain(@grid)
        .flatten()
        .countBy (c) => c.type
        .values()
        .any (c) => c > 2
        .value()

    shuffle: ->
      unless @canShuffle()
        throw new Error "Can't shuffle"

      cups = _.chain(@grid).flatten()
      while not @hasPossible() or @findMatches().length
        @grid = cups
          .shuffle()
          .groupBy (v, i) => Math.floor(i / @width)
          .toArray()
          .value()

      anims = []
      @eachCups (cup, x, y) =>
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
      @lock += 1
      if h.length > 0
        async.parallel h, =>
          c?()
          @lock -= 1
      else
        c?()
        @lock -= 1
