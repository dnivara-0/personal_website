const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;

    if (keysPressed['c'] && event.key == 'm') {
        window.location.href = 'maze.html'
    }

    if (keysPressed['c'] && event.key == 's') {
        window.location.href = 'secretMessage.html'
    }
});

document.addEventListener('keyup', (event) => {
    delete keysPressed[event.key];
 });