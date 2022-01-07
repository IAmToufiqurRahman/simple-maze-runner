const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter

// create an engine
const engine = Engine.create()

engine.world.gravity.y = 0

const { world } = engine

const width = 600
const height = 600
const cells = 3

// unit length for rectangle
const unitLength = width / cells

// create a renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width,
    height
  }
})

// run the renderer
Render.run(render)

// create runner
const runner = Runner.create()

// run the engine
Runner.run(runner, engine)

// Walls
const walls = [Bodies.rectangle(width / 2, 0, width, 4, { isStatic: true }), Bodies.rectangle(width / 2, height, width, 4, { isStatic: true }), Bodies.rectangle(0, height / 2, 4, height, { isStatic: true }), Bodies.rectangle(width, height / 2, 4, height, { isStatic: true })]

World.add(world, walls)

// suffle function to randomize
const shuffle = (arr) => {
  let counter = arr.length

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter)

    counter--

    const temp = arr[counter]
    arr[counter] = arr[index]
    arr[index] = temp
  }

  return arr
}

// Maze generation
const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false))

// vertical walls
const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false))

// horizontal walls
const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false))

const startRow = Math.floor(Math.random() * cells)
const startColumn = Math.floor(Math.random() * cells)

// this function is gonna iterate over the maze
const stepThroughCell = (row, column) => {
  // if I've visited the cell at [row, column] already, then return
  if (grid[row][column] === true) {
    return
  }

  // Mrk this cell as visited
  grid[row][column] = true

  // Assemble randomly-orderded list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ])

  // for each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor

    // see if that neighbor is out of bound
    if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
      // don't wanna run any code for this neighbor pair, continue to the next iteration
      continue
    }

    // if we have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue // move on to the next iteration
    }
    // remove a wall from either horizontal or vertical array
    if (direction === 'left') {
      verticals[row][column - 1] = true
    } else if (direction === 'right') {
      verticals[row][column] = true
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true
    } else if (direction === 'down') {
      horizontals[row][column] = true
    }

    // visit that next cell
    stepThroughCell(nextRow, nextColumn)
  }
}

stepThroughCell(startColumn, startColumn)

// iterate over the horizonatal array
// recerives the inner array
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return
    }

    const wall = Bodies.rectangle(columnIndex * unitLength + unitLength / 2, rowIndex * unitLength + unitLength, unitLength, 5, {
      label: 'wall',
      isStatic: true
    })
    World.add(world, wall)
  })
})

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return
    }

    const wall = Bodies.rectangle(columnIndex * unitLength + unitLength, rowIndex * unitLength + unitLength / 2, 5, unitLength, {
      label: 'wall',
      isStatic: true
    })
    World.add(world, wall)
  })
})

// Goal
const goal = Bodies.rectangle(width - unitLength / 2, height - unitLength / 2, unitLength * 0.7, unitLength * 0.7, {
  label: 'goal',
  isStatic: true
})
World.add(world, goal)

// Ball
const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 4, {
  label: 'ball'
})
World.add(world, ball)

document.addEventListener('keydown', (event) => {
  const { x, y } = ball.velocity

  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 })
  }

  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y })
  }

  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 })
  }

  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y })
  }
})

// Win Condition
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal']

    if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
      world.gravity.y = 1
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false)
        }
      })
    }
  })
})
