PropertyMixin =
  property: (prop, options) ->
    Object.defineProperty @prototype, prop, options

  addProperty: (name) ->
    @property name,
      get: -> @["_#{name}"]
      set: (value) ->
        if @["set#{name.capitalize()}"]?
          @["set#{name.capitalize()}"](value)
        else
          @setProp(name, value)

  extended: ->
    @::setProp = (name, value) ->
      if @["_#{name}"] != value
        @["_#{name}"] = value
        @trigger? "change:#{name}", @["_#{name}"]
      @["_#{name}"]
