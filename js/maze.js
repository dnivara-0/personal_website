const {Engine, Render, Runner, World, Bodies, Body, Events} = Matter;

// cellsVertical corresponds to number of rows 
// cellsHorizontal corresponds to number of columns
const cellsHorizontal = 12;
const cellsVertical = 9;
const width = window.innerWidth;
const height = window.innerHeight;
const wallThickness = 5;

const unitLengthX = width/cellsHorizontal;
const unitLengthY = height/cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const {world} = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width,
        height,
        wireframes: false
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
    //(x-coordinate of center of rec, y-coordinate of center of rec, width of rec, height of rec)
    Bodies.rectangle(width/2, 0, width, 2, { isStatic: true }), 
    Bodies.rectangle(width/2, height, width, 2, { isStatic: true }),
    Bodies.rectangle(0, height/2, 2, height, { isStatic: true }),
    Bodies.rectangle(width,height/2, 2, height, { isStatic: true })
];

World.add(world, walls);

//Maze Generation

const shuffle = (arr) => {
    let counter = arr.length;
    while(counter > 0){
        const index = Math.floor(Math.random()*counter);

        counter--;
        [arr[counter], arr[index]] = [arr[index], arr[counter]]; //swap elements using destructuring syntax.
    }
    return arr;
}

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));
//If you use another Array.fill() in the fill the same array reference will be used in all the three elements.
//That's the reason we had to use map which helps us returning new array for every element in the array.

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));


const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    // If I have visited the cell at [row, column], then return
    if(grid[row][column] === true) return;

    // Mark this cell as visited
    grid[row][column] = true;

    // Assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
    // For each neighbor
    for(let neighbor of neighbors){
        const[nextRow, nextColumn, direction] = neighbor;
        // See if that neighbor is out of bounds
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue; //skip to next iteration
        }

        // If we have visited that neighbor, continue to next neighbor
        if(grid[nextRow][nextColumn] === true){
            continue;
        }

        // Remove a wall from either horizontals or verticals
        if(direction === 'left') {
            verticals[row][column - 1] = true;
        } else if(direction === 'right'){
            verticals[row][column] = true;
        } else if(direction === 'up'){
            horizontals[row - 1][column] = true;
        } else if(direction === 'down'){
            horizontals[row][column] = true;
        }

        // We can also write the above code to remove wall like below.
        // if(direction === 'left' || direction === 'right'){
        //     verticals[row][Math.min(column, nextColumn)] = true;
        // } else if(direction === 'up' || direction === 'down'){
        //     horizontals[Math.min(row, nextRow)][column] = true;
        // }


        // Visit that next cell
        stepThroughCell(nextRow, nextColumn);
    };

       
};

stepThroughCell(startRow, startColumn);

// adding horizontal walls
// true means no wall, false means there is a wall
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open === true) return;

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX/2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            wallThickness,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'purple'
                }
            }
        );
        World.add(world, wall);
    });
});

//adding vertical walls
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open === true) return;

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY/2,
            wallThickness,
            unitLengthY,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'purple'
                }
            }
        );
        World.add(world, wall);
    });
});

// Goal
const goal = Bodies.rectangle(
    width - unitLengthX/2,
    height - unitLengthY/2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'green'
        }
    }
);

World.add(world, goal);

// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) * 0.3;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius, //radius
    {
        label: 'ball',
        render: {
            fillStyle: 'pink'
        }
    }
);

World.add(world, ball);

// Key press event handling
document.addEventListener('keydown', (event) => {
    const key = event.key.toLocaleLowerCase();
    const {x, y} = ball.velocity;

    if(key === 'w'){
        Body.setVelocity(ball, {x, y: y - 5});
    }
    if(key === 's'){
        Body.setVelocity(ball, {x, y: y + 5});
    }
    if(key === 'a'){
        Body.setVelocity(ball, {x: x - 5, y});
    }
    if(key === 'd'){
        Body.setVelocity(ball, {x: x + 5, y});
    }
});

// Win Condition
Events.on(engine, 'collisionStart', event => {
    // After collision all the properties inside of event object get wiped out.
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            world.gravity.y = 1;

            world.bodies.forEach((body) => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            });

            //Body.setStatic(goal, false);

            document.querySelector('.winner').classList.remove('hidden');

        }
    });
})