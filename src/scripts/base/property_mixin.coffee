PropertyMixin =
  property: (prop, options) ->
    Object.defineProperty @prototype, prop, options

  addProperty: (name, cbs...) ->
    @property name,
      get: -> @["_#{name}"]
      set: (value) ->
        n = "set#{name.capitalize()}"
        if @[n]?
          r = @[n](value)
        else
          r = @setProp(name, value)
        for cb in cbs
          @[cb]?()
        r

  extended: ->
    @::setProp = (name, value) ->
      if @["_#{name}"] != value
        @["_#{name}"] = value
        @trigger? "change:#{name}", @["_#{name}"]
      @["_#{name}"]
