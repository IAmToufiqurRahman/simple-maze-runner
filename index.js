const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter

// create an engine
const engine = Engine.create()

const { world } = engine

world.gravity.y = 0

const cellsHorizontal = 12
const cellsVertical = 9
const width = window.innerWidth * 0.9954333
const height = window.innerHeight * 0.9954333

// unit length for rectangle
const unitLengthX = width / cellsHorizontal
const unitLengthY = height / cellsVertical

// create a renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
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
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false))

// vertical walls
const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false))

// horizontal walls
const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false))

const startRow = Math.floor(Math.random() * cellsVertical)
const startColumn = Math.floor(Math.random() * cellsHorizontal)

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
    if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
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

stepThroughCell(startRow, startColumn)

// iterate over the horizonatal array
// recerives the inner array
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return
    }

    const wall = Bodies.rectangle(columnIndex * unitLengthX + unitLengthX / 2, rowIndex * unitLengthY + unitLengthY, unitLengthX, 5, {
      label: 'wall',
      isStatic: true,
      render: {
        fillStyle: '#DD4A48'
      }
    })
    World.add(world, wall)
  })
})

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return
    }

    const wall = Bodies.rectangle(columnIndex * unitLengthX + unitLengthX, rowIndex * unitLengthY + unitLengthY / 2, 5, unitLengthY, {
      label: 'wall',
      isStatic: true,
      render: {
        fillStyle: '#9BDEAC'
      }
    })
    World.add(world, wall)
  })
})

// Goal
const goal = Bodies.rectangle(width - unitLengthX / 2, height - unitLengthY / 2, unitLengthX * 0.7, unitLengthY * 0.7, {
  label: 'goal',
  isStatic: true,
  render: {
    fillStyle: '#FF0075'
  }
})
World.add(world, goal)

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: 'ball',
  render: {
    fillStyle: '#3DB2FF'
  }
})
World.add(world, ball)

document.addEventListener('keydown', (event) => {
  const { x, y } = ball.velocity

  if (event.keyCode === 87 || event.keyCode === 38) {
    Body.setVelocity(ball, { x, y: y - 5 })
  }

  if (event.keyCode === 68 || event.keyCode === 39) {
    Body.setVelocity(ball, { x: x + 5, y })
  }

  if (event.keyCode === 83 || event.keyCode === 40) {
    Body.setVelocity(ball, { x, y: y + 5 })
  }

  if (event.keyCode === 65 || event.keyCode === 37) {
    Body.setVelocity(ball, { x: x - 5, y })
  }
})

// Win Condition
Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal']

    if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
      document.querySelector('.winner').classList.remove('hidden')

      document.querySelector('.btn').classList.remove('hidden')

      world.gravity.y = 1
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false)
        }
      })
    }
  })
})
