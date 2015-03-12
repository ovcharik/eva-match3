namespace ui:

  class Field extends Module
    @include ViewMixin

    ui:
      score:    '.Score'
      moves:    '.Moves'
      counters: '.CupsCounters'
      canvas:   '.Canvas'

    constructor: (model) ->
      @setUI()

      @cupCounters = new ui.CupsCounters(@ui.counters, model)
      @moves = new ui.Counter(@ui.moves, 'moves', model)
      @score = new ui.Counter(@ui.score, 'score', model)
