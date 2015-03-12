namespace ui:

  class CupsCounters extends Module
    @extend PropertyMixin
    @include ViewMixin

    @addProperty 'model'

    ui:
      counters: '.CupsCounter'

    constructor: (el, model) ->
      @setElement el

      @counters = {}
      @ui.$counters.each (i, el) =>
        counter = new ui.CupsCounter(el)
        @counters[counter.name] = counter

      @model = model

    setModel: (model) ->
      @_model = model
      return @_model unless model

      for key, value of @_model.counters
        @counters[key]?.model = value

