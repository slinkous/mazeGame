
// Variables \\
Game = {};
Game.scenes = [];
Game.scenes[1] = {};
Game.layers = [];
Game.layers[1] = {};
Game.maze = {};
Game.frameCount = 0;
GRID_SIZE = 21;
TILE_SIZE = 40;

// Resources \\

Game.res = {
  skater_png: "stick_skater1.png",
  snail_png: "snail2.png",
  wall_png: "wall.png",
  shrubwall_png: "shrubwall.png",
  maze_txt: "maze.txt",
  snailsplash_png: "snailsplash.png"
};

Game.g_resources = [];

for(var i in Game.res){
  Game.g_resources.push(Game.res[i]);
}

// Game.maze = parseMaze(Game.res.maze_txt);

// Layers \\

Game.layers[1].extend = cc.Layer.extend({
  init: function(){
    this._super();
    var game = this;
    Game.layers[1].start(game);
  }
})
Game.layers[1].start = function(game){
  var size = cc.director.getWinSize();
  layer = cc.LayerColor.create(new cc.Color(47, 36, 30, 255), size.width, size.height);
  // layer = cc.LayerColor.create(cc.color.WHITE, size.width, size.height);
  game.addChild(layer);
  setWalls(Game.maze, layer);
  Game.snail = new player();
  layer.addChild(Game.snail);

  var destination = findGridLocation(21, 20);
  Game.snail.findPath(destination.x, destination.y)

}

var player = cc.Sprite.extend({
  ctor: function(){
    this._super();
    this.initWithFile(Game.res.snail_png);
    this.scale = 1;
    this.anchorX = 0;
    this.anchorY = 1;
    var loc = findGridLocation(0,1)
    this.setPosition(loc.x, loc.y)
    this.speed = 1;
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
    var tileSize = size.width/GRID_SIZE;


    var distanceSquared = (goalX - this.x)**2 + (goalY - this.y)**2
    open.push({x:this.x, y: this.y, dist: distanceSquared})

    while(tries++<1000){
      var current;

      if(open.length > 0){
        current = open.sort((a, b) => a.dist > b.dist ? -1:1).pop()
      }

      closed.push(current);

      if(current.x == goalX && current.y == goalY){
        console.log("reached goal")
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
        neighbors.push({x: current.x - tileSize, y: current.y})
      }
      if(current.x < size.width){
        neighbors.push({x: current.x + tileSize, y: current.y})
      }
      if(current.y > 0){
        neighbors.push({x: current.x, y: current.y - tileSize})
      }
      if(current.y < size.height){
        neighbors.push({x: current.x, y: current.y + tileSize})
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
  },
  traversePath: function(){
    if(this.progress >= this.path.length){
      this.path = [];
      return;
    }
    this.moveTo(this.path[this.progress])
    if(this.x % TILE_SIZE == 0 && this.y % TILE_SIZE == 0){
      this.progress++
    }
    console.log(Game.frameCount)
    if(Game.frameCount % this.animationSpeed == 0){
      this.frame++
      this.frame %= this.numFrames;
      console.log(this.frame)
    }
    this.setTextureRect(cc.rect(this.frame*this.width,this.height*this.animNum, this.width, this.height));
  }
})

// Scenes \\

Game.scenes[1].extend = cc.Scene.extend({
  onEnter: function(){
    this._super();
    var layer = new Game.layers[1].extend();
    layer.init();
    this.addChild(layer);
    this.scheduleUpdate()
  },
  update: function(dt){
    Game.frameCount++
    Game.snail.traversePath();
  }
})

// Run Game \\

fetch('maze.txt')
.then(response => response.text())
.then((data) => {
  Game.maze = parseMaze(data)
})

cc.game.onStart = function(){
  cc.LoaderScene.preload(Game.g_resources, function () {
    cc.director.runScene(new Game.scenes[1].extend());
  }, this);
};

window.onload = function(){
    cc.game.run("gameCanvas");
};

// Maze Parsing \\

function parseMaze(textData){
  var mazeArr = textData.split("\n")
  mazeArr = mazeArr.filter((l) => {return l.length > 0 && l.search(/\S/) != -1})
  var colCount = ((mazeArr[0].length - 1)/3)*2 + 1
  var rowCount = mazeArr.length + 1
  var col;
  var tiles =[];
  for(var i = 0; i < mazeArr.length; i++){
    col = 0;
    for(var j = 0; j < mazeArr[i].length; j++){
      //skips every third character
      if((j+1)%3 == 0){
        continue;
      }
      if(mazeArr[i][j] == "+" || mazeArr[i][j] == "-" || mazeArr[i][j] == "|"){
        tiles.push({col: col, row: i})
      }
      col += 1;
    }
  }
  return {rows: rowCount, cols: colCount, tiles: tiles}
}

function setWalls(tileData, layer){
  var size = cc.director.getWinSize();

  for(var tile of tileData.tiles){
    var wall = new cc.Sprite(Game.res.shrubwall_png);
    wall.attr({
      x: TILE_SIZE*tile.col,
      y: size.height - TILE_SIZE*tile.row,
      anchorX: 0,
      anchorY: 1,
      scale: 1,
    });

    // console.log(wall.x)
    layer.addChild(wall);
  }
}

function findGridLocation(col, row){
  var size = cc.director.getWinSize();
  // var tileSize = size.width/GRID_SIZE;
  return({x: col*TILE_SIZE, y:size.height-row*TILE_SIZE})
}
