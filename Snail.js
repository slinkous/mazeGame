var Snail = cc.Sprite.extend({
  ctor: function(){
    this._super();
    this.initWithFile(Game.res.snail_png);
    this.scale = 1;
    this.anchorX = 0;
    this.anchorY = 1;
    var loc = Game.maze.findGridLocation(0,1)
    this.setPosition(loc.x, loc.y)
    this.speed = 4;
    this.frame = 0;
    this.numFrames = 4;
    this.animationSpeed = 10;
    this.animationNumber = 3;
    this.width = 40;
    this.height = 40;
  },
  moveTo: function(loc){

    var dx = Math.sign(loc.x - this.x)
    var dy = Math.sign(loc.y - this.y)

    if (dx > 0) { this.animNum = 0; }
    if (dx < 0) { this.animNum = 1; }
    if (dy > 0) { this.animNum = 2; }
    if (dy < 0) { this.animNum = 3; }

    this.x += dx*this.speed;
    this.y += dy*this.speed;

  },

  findPath: function(goalX, goalY){
    var open = [];
    var closed = [];
    var tries = 0;
    var size = cc.director.getWinSize();


    var distanceSquared = (goalX - this.x)**2 + (goalY - this.y)**2
    open.push({x:this.x, y: this.y, dist: distanceSquared})

    while(tries++<1000){
      var current;

      if(open.length > 0){
        current = open.sort((a, b) => a.dist > b.dist ? -1:1).pop()
      }

      closed.push(current);

      if(current.x == goalX && current.y == goalY){
        var path = [];
        var step = closed.pop();
        while(step.parent){
          path.push(step);
          step = step.parent;
        }
        this.setPath(path.reverse());
      }
      //get all the available neighboring tiles
      neighbors = [];
      if(current.x > 0){
        neighbors.push({x: current.x - TILE_SIZE, y: current.y})
      }
      if(current.x < size.width){
        neighbors.push({x: current.x + TILE_SIZE, y: current.y})
      }
      if(current.y > 0){
        neighbors.push({x: current.x, y: current.y - TILE_SIZE})
      }
      if(current.y < size.height){
        neighbors.push({x: current.x, y: current.y + TILE_SIZE})
      }
      for(var n of neighbors){
        if(closed.find((c)=> c.x == n.x && c.y == n.y)){
          continue;
        }
        if(Game.maze.tiles.find((t)=> t.col*TILE_SIZE == n.x && (GRID_SIZE - t.row)*TILE_SIZE == n.y)){
          continue;
        }
        if(open.find((o) => o.x == n.x && o.y == n.y)){
          continue;
        }

        var currentDistance = (current.x - n.x)**2 + (current.y - n.y)**2;
        var goalDistance = (goalX - n.x)**2 + (goalY - n.y)**2;
        open.push({x: n.x, y: n.y, dist: currentDistance+goalDistance, parent: current})
      }

    }
    console.log("no solution found")
    return;

  },
  setPath: function(path){
    
    this.path = path;
    this.progress = 0;
    console.log(path)
  },
  traversePath: function(){
    if(!this.path){
      console.log("Couldn't solve the maze!")
      return;
    }
    if(this.progress >= this.path.length-2){
      // console.log("At the end of the road")
      this.path = [];
      return;
    }
    this.moveTo(this.path[this.progress])
    if(this.x % TILE_SIZE == 0 && this.y % TILE_SIZE == 0){
      this.progress++
    }
    if(Game.frameCount % this.animationSpeed == 0){
      this.frame++
      this.frame %= this.numFrames;
    }
    this.setTextureRect(cc.rect(this.frame*this.width,this.height*this.animNum, this.width, this.height));
  }
})
