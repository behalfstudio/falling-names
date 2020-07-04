// viewport dimensions
const vw = Math.max(
  document.documentElement.clientWidth,
  window.innerWidth || 0
);
const vh = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
);

const groundThickness = 1000;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const dir = "./assets/svg/";
var republish = "REPUBLISH";

const MAX_LETTER_COUNT = 40;
const TIMEOUT = 3000;

const viewportScaleRate = Math.sqrt(vw * vh) / 4000;

/*------------------------------------------------------------*/

function random(min, max) {
  return min + Math.random() * (max - min);
}

/*------------------------------------------------------------*/

var fallingCanvas = document.getElementById("falling");

// module aliases
var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Body = Matter.Body,
  Events = Matter.Events,
  Composite = Matter.Composite,
  Composites = Matter.Composites,
  Common = Matter.Common,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Svg = Matter.Svg;

// create an engine
var engine = Engine.create(),
  world = engine.world;

// create a renderer
var render = Render.create({
  canvas: fallingCanvas,
  element: document.body,
  engine: engine,
  options: {
    width: vw,
    height: vh,
    background: "#000",
    wireframes: false,
    showAngleIndicator: false,
  },
});

var letterCount = 0;

/*------------------------------------------------------------*/

function addName() {
  var newName = $("#name").val().toUpperCase();

  var validCharacters = 0;
  for (var i = 0; i < newName.length; i++) {
    if (alphabet.includes(newName[k])) {
      validCharacters++;
    }
  }

  /*
  if (letterCount + validCharacters >= MAX_LETTER_COUNT) {
    filterCollisions(false);
    window.setTimeout(function () {
      filterCollisions(true);
    }, TIMEOUT);
  }
  */

  for (var k = 0; k < newName.length; k++) {
    if (alphabet.includes(newName[k])) {
      letterCount++;
      console.log(letterCount);

      document.getElementById("name").value = "";

      $.get(dir + newName[k] + ".svg").done(function (data) {
        var vertexSets = [],
          color = "#FFF";

        $(data)
          .find("path")
          .each(function (i, path) {
            vertexSets.push(Svg.pathToVertices(path, 10));
          });

        var randomScale = random(0.4, 1.8);

        var letter = Bodies.fromVertices(
          random(0, vw),
          random(-vh, 0),
          vertexSets,
          {
            render: {
              fillStyle: color,
              strokeStyle: color,
              lineWidth: 1,
            },
            restitution: 0.2,
          },
          true
        );

        Body.scale(
          letter,
          viewportScaleRate * randomScale,
          viewportScaleRate * randomScale
        );

        Body.rotate(letter, random(-Math.PI / 2, Math.PI / 2));

        Body.collisionFilter = {
          group: 1,
        };

        World.add(world, letter);
      });
    }
  }
}

function filterCollisions(mode) {
  // turn off
  if (!mode) {
    inputBox.collisionFilter = {
      group: -1,
    };
    bottomGround.collisionFilter = {
      group: -1,
    };

    console.log("Collision turned off.");
  }
  // turn on
  else {
    inputBox = Bodies.rectangle(
      vw - $("#name_input").width() / 2 - 25,
      vh - $("#name_input").height() / 2 - 25,
      $("#name_input").width() + 50,
      $("#name_input").height() + 50,
      {
        isStatic: true,
        collisionFilter: {
          group: 1,
        },
      }
    );
    bottomGround = Bodies.rectangle(
      vw / 2,
      vh + groundThickness / 2,
      vw + groundThickness * 2,
      groundThickness,
      {
        isStatic: true,
        collisionFilter: {
          group: 1,
        },
      }
    );
    console.log("Collision turned on.");
  }
}

/*------------------------------------------------------------*/

var inputBox = Bodies.rectangle(
  vw - $("#name_input").width() / 2 - 25,
  vh - $("#name_input").height() / 2 - 25,
  $("#name_input").width() + 50,
  $("#name_input").height() + 50,
  {
    isStatic: true,
    collisionFilter: {
      group: 1,
    },
  }
);

World.add(world, inputBox);

// add grounds
World.add(world, [
  // left
  Bodies.rectangle(-groundThickness / 2, vh / 2, groundThickness, vh * 3, {
    isStatic: true,
  }),
  // right
  Bodies.rectangle(vw + groundThickness / 2, vh / 2, groundThickness, vh * 3, {
    isStatic: true,
  }),
  // top
  Bodies.rectangle(
    vw / 2,
    -groundThickness / 2 - vh,
    vw + groundThickness * 2,
    groundThickness,
    {
      isStatic: true,
    }
  ),
]);

// bottom ground
var bottomGround = Bodies.rectangle(
  vw / 2,
  vh + groundThickness / 2,
  vw + groundThickness * 2,
  groundThickness,
  {
    isStatic: true,
    collisionFilter: {
      group: 1,
    },
  }
);

World.add(world, bottomGround);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

/*------------------------------------------------------------*/

// add mouse control
var mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.5,
      render: {
        visible: false,
      },
    },
  });

mouseConstraint.mouse.element.removeEventListener(
  "mousewheel",
  mouseConstraint.mouse.mousewheel
);
mouseConstraint.mouse.element.removeEventListener(
  "DOMMouseScroll",
  mouseConstraint.mouse.mousewheel
);

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
  min: { x: 0, y: 0 },
  max: { x: vw, y: vh },
});
