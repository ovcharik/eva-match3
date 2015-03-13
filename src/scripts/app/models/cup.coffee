namespace models:
  class Cup extends Module
    @extend PropertyMixin
    @include EventMixin

    @addProperty 'type'

    constructor: (@type) ->
