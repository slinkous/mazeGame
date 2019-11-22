
// Variables \\
Game = {};
Game.scenes = [];
Game.scenes[1] = {};
Game.layers = [];
Game.layers[1] = {};
Game.maze = {};
GRID_SIZE = 21;
TILE_SIZE = 40;

// Resources \\

Game.res = {
  skater_png : "stick_skater1.png",
  wall_png: "wall.png",
  maze_txt: "maze.txt"
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
  // layer = cc.LayerColor.create(new cc.Color(255, 0, 128, 255), size.width, size.height);
  layer = cc.LayerColor.create(cc.color.WHITE, size.width, size.height);
  game.addChild(layer);
  var skater = new player();

  console.log(skater)
  layer.addChild(skater);
  setWalls(Game.maze, layer);
  var destination = findGridLocation(21, 20);

  var path = skater.findPath(destination.x, destination.y);
  // skater.traversePath(path)
  skater.moveTo(path[20])
  //
  // var label = cc.LabelTTF.create("Maze Game", "Courier", 40);
  // label.setPosition(size.width/2, size.height/2);
  // label.setColor(cc.color.BLACK)
  // game.addChild(label, 1)
  for (var space of path){
    var label = cc.LabelTTF.create("X", "Courier", 36);
    label.setPosition(space.x, space.y);
    label.setColor(cc.color.RED)
    game.addChild(label, 1)
  }
}

var player = cc.Sprite.extend({
  ctor: function(){
    this._super();
    this.initWithFile(Game.res.skater_png);
    this.scale = TILE_SIZE / 16
    this.anchorX = 0;
    this.anchorY = 1;
    var loc = findGridLocation(0,1)
    this.setPosition(loc.x, loc.y)
    this.direction = "right";
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.speed = 1;
  },
  moveTo: function(loc){

    this.moveX = loc.x - this.x;
    this.moveY = loc.y - this.y;
    this.runAction(new cc.MoveBy(1, cc.p(this.moveX, this.moveY)));
  },
  move: function(){
    switch (this.direction) {
      case "right":
        this.xSpeed = 1;
        this.ySpeed = 0;
        break;
      case "left":
        this.xSpeed = -1;
        this.ySpeed = 0;
        break;
      case "up":
        this.xSpeed = 0;
        this.ySpeed = 1;
        break;
      case "down":
        this.xSpeed = 0;
        this.ySpeed = -1;
        break;
      default:
        this.xSpeed = 0;
        this.ySpeed = 0;
    }
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
        return closed;
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
        if(Game.maze.tiles.find((t)=> t.col*TILE_SIZE == n.x && t.row*TILE_SIZE == n.y)){
          continue;
        }
        if(open.find((o) => o.x == n.x && o.y == n.y)){
          continue;
        }

        var currentDistance = (current.x - n.x)**2 + (current.y - n.y)**2;
        var goalDistance = (goalX - n.x)**2 + (goalY - n.y)**2;
        open.push({x: n.x, y: n.y, dist: currentDistance+goalDistance})
      }

    }
    console.log("no solution found")
    return;

  },
  traversePath: function(path){
    for(var space of path){
      this.moveTo(space)
      console.log(space)
    }
  }
})

// Scenes \\

Game.scenes[1].extend = cc.Scene.extend({
  onEnter: function(){
    this._super();
    var layer = new Game.layers[1].extend();
    layer.init();
    this.addChild(layer);
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
    console.log(cc)
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

  Game.tileSize = size.width/tileData.cols;

  var scale = Game.tileSize/ 16
  for(var tile of tileData.tiles){
    var wall = new cc.Sprite(Game.res.wall_png);
    wall.attr({
      x: Game.tileSize*tile.col,
      y: size.height - Game.tileSize*tile.row,
      anchorX: 0,
      anchorY: 1,
      scale: scale,
    });
    // console.log(wall.x)
    layer.addChild(wall);
  }
}

function findGridLocation(col, row){
  var size = cc.director.getWinSize();
  var tileSize = size.width/GRID_SIZE;
  return({x: col*tileSize, y:size.height-row*tileSize})
}
