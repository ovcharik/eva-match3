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
      @moving = null

      @shape = new createjs.Shape
      @shape.set
        snapToPixel: true
        x: @x
        y: @y

      # @shape.addEventListener 'click',     => @model.trigger 'click'
      # @shape.addEventListener 'dblclick',  => @model.trigger 'dblclick'

      @shape.addEventListener 'mousedown', (event) =>
        @moving =
          x: event.rawX
          y: event.rawY

      @shape.addEventListener 'pressup', (event) =>
        return unless @moving
        unless @shifted(event.rawX, event.rawY)
          @model.trigger 'click'
        @moving = null

      @shape.addEventListener 'pressmove', (event) =>
        return unless @moving
        if @shifted(event.rawX, event.rawY)
          x = event.rawX - @moving.x
          y = event.rawY - @moving.y
          if Math.abs(x) > Math.abs(y)
            x = Math.sign(x)
            y = 0
          else
            x = 0
            y = Math.sign(y)
          @model.trigger 'move', x, y
          @moving = null

      @model.on 'change:selected', => @draw()
      @model.on 'change:col', => @calc()
      @model.on 'change:row', => @calc()

    shifted: (x, y) ->
      d = @size * 0.2
      @moving and (
        Math.abs(@moving.x - x) > d or
        Math.abs(@moving.y - y) > d
      )

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

    move: (col, row, init..., cb) ->
      x = @calcX row
      y = @calcY col
      if init.length == 2
        [sx, sy] = [@calcX(init[0]), @calcY(init[1])]
      else
        [sx, sy] = [@x, @y]
      createjs.Tween.get @shape
        .set { x: sx, y: sy }
        .to { x: x, y: y }, @anim.delay, @anim.type
        .call cb

    hide: (cb) ->
      createjs.Tween.get @shape
        .to {scaleX: 0, scaleY: 0}, @anim.delay, @anim.type
        .call cb

    show: (cb) ->
      createjs.Tween.get @shape
        .to {scaleX: 1, scaleY: 1}, @anim.delay, @anim.type
        .call cb
