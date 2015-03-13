namespace ui:
  class Cup extends Module
    @extend PropertyMixin
    @include EventMixin

    anim:
      delay: 400
      type: createjs.Ease.circInOut

    colors:
      red     : "#F15A5A"
      yellow  : "#F0C419"
      green   : "#4EBA6F"
      blue    : "#2D95BF"
      magenta : "#955BA5"

    darkenColors:
      red     : "#CB3434"
      yellow  : "#CA9E00"
      green   : "#289449"
      blue    : "#076F99"
      magenta : "#6F357F"

    @addProperty 'x', 'setShapeX'
    @addProperty 'y', 'setShapeY'
    @addProperty 'size', 'calc'
    @addProperty 'radius', 'draw'
    @addProperty 'color', 'draw'
    @addProperty 'darkenColor', 'draw'
    @addProperty 'shape', 'draw'

    shadow: new createjs.Shadow('#000', 0, 0, 5, 2)

    constructor: (cx, cy, size, model) ->
      @model = model
      @size = size

      @shape = new createjs.Shape
      @shape.set
        snapToPixel: true
        x: @x
        y: @y

      @shape.addEventListener 'click', => @model.trigger 'click'

      @model.on 'change:selected', => @draw()
      @model.on 'change:col', => @calc()
      @model.on 'change:row', => @calc()

    calcX: (col) -> col * @size + @size / 2
    calcY: (row) -> row * @size + @size / 2

    calc: ->
      @cellX = @model.col
      @cellY = @model.row
      @x = @calcX @cellX
      @y = @calcY @cellY
      @radius = @size * 0.7 / 2
      @color = @colors[@model.type]
      @darkenColor = @darkenColors[@model.type]

    draw: ->
      return unless @shape
      @shape.graphics.clear()
      if @model.selected
        @shape.graphics
          .beginFill(@darkenColor)
          .drawCircle(0, 0, @radius)
          .beginFill(@color)
          .drawCircle(0, 0, @radius * 0.70)
      else
        @shape.graphics
          .beginFill(@color)
          .drawCircle(0, 0, @radius)

    setShapeX: ->
      @shape?.x = @x

    setShapeY: ->
      @shape?.y = @y

    move: (col, row, cb) ->
      x = @calcX row
      y = @calcY col
      createjs.Tween.get @shape
        .to({ x: x, y: y }, @anim.delay, @anim.type)
        .call(cb)
