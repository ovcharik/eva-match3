namespace ui:
  class Cup extends Module
    @extend PropertyMixin
    @include EventMixin

    colors:
      red     : "#F15A5A"
      yellow  : "#F0C419"
      green   : "#4EBA6F"
      blue    : "#2D95BF"
      magenta : "#955BA5"

    @addProperty 'x', 'setShapeX'
    @addProperty 'y', 'setShapeY'
    @addProperty 'size', 'calc'
    @addProperty 'radius', 'draw'
    @addProperty 'color', 'draw'
    @addProperty 'shape', 'draw'
    @addProperty 'cellX'
    @addProperty 'cellY'

    constructor: (cx, cy, size, model) ->
      @cellX = cx
      @cellY = cy
      @model = model
      @size = size

      @shape = new createjs.Shape
      @shape.set
        snapToPixel: true
        x: @x
        y: @y

    calc: ->
      @x = @cellX * @size + @size / 2
      @y = @cellY * @size + @size / 2
      @radius = @size * 0.7 / 2
      @color = @colors[@model.type]

    draw: ->
      return unless @shape
      @shape.graphics
        .beginFill(@color)
        .drawCircle(0, 0, @radius)

    setShapeX: ->
      @shape?.x = @x

    setShapeY: ->
      @shape?.y = @y
