PropertyMixin =
  property: (prop, options) ->
    Object.defineProperty @prototype, prop, options
