namespace ui:

  class CupsCounter extends Module
    @extend PropertyMixin
    @include ViewMixin

    ui:
      score: '.CupScore'
      all: '.All'

    @property 'score',
      get: -> @_score
      set: (value) -> @setScore(value)

    @property 'all',
      get: -> @_all
      set: (value) -> @setAll(value)

    @property 'visible',
      get: -> @_visible
      set: (value) -> @setVisible(value)

    @property 'model',
      get: -> @_model
      set: (value) -> @setModel(value)

    constructor: (el, model) ->
      @setElement el
      @name = @$el.data('name')
      @model = model

    show: ->
      @$el.show()

    hide: ->
      @$el.hide()

    setScore: (value) ->
      @_score = Number(value)
      @ui.$score.text @_score
      @_score

    setAll: (value) ->
      @_all = Number(value)
      @ui.$all.text @_all
      @_all

    setVisible: (value) ->
      @_visible = Boolean(value)
      if @_visible
        @show()
      else
        @hide()
      @_visible

    setModel: (model) ->
      @_handlers ?=
        score:   _.bind @setScore, @
        all:     _.bind @setAll, @
        visible: _.bind @setVisible, @

      # unbind
      if @_model
        for key, value of @_handlers
          @_model.off? "change:#{key}", value

      @_model = model
      unless @_model
        @all     = 0
        @score   = 0
        @visible = false
        return @_model

      @all     = @_model.all
      @score   = @_model.all
      @visible = @_model.all

      # bind
      for key, value of @_handlers
        @_model.on? "change:#{key}", value

      @_model
