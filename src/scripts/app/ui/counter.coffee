namespace ui:

  class Counter extends Module
    @extend PropertyMixin
    @include ViewMixin

    @addProperty 'value'
    @addProperty 'model'

    constructor: (el, @prop, model) ->
      @setElement el
      @model = model

    setValue: (value) ->
      @_value = Number(value)
      @$el.text @_value
      @_value

    setModel: (model) ->
      @_handler ?= _.bind @setValue, @
      if @_model
        @_model.off? "change:#{@prop}", @_handler
      @_model = model
      unless @_model
        @value = 0
        return @_model
      @value = @_model[@prop]
      @_model.on? "change:#{@prop}", @_handler
      @_model

