namespace ui:

  class Field extends Module
    @include ViewMixin

    ui:
      score:    '.Score'
      moves:    '.Moves'
      counters: '.CupsCounters'
      canvas:   '.Canvas'

    constructor: (@game) ->
      @setUI()

      @cupCounters = new ui.CupsCounters(@ui.counters, @game)
      @moves = new ui.Counter(@ui.moves, 'moves', @game)
      @score = new ui.Counter(@ui.score, 'score', @game)

      @game.on 'change:win', (win) =>
        if win
          alert('Win!')
          window.location = window.location

      @game.on 'change:fail', (fail) =>
        if fail
          alert('Fail!')
          window.location = window.location
