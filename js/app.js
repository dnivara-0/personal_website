const keysPressed = {};
document.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;

    if (keysPressed['c'] && event.key == 'm') {
        window.location.href = 'maze.html'
    }
});