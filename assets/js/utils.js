// assets/js/utils.js

// Algoritmo de búsqueda A* para encontrar el camino en el área de juego
function findPath(start, goal, gameArea) {
    const openSet = [start];
    const cameFrom = {};
    const gScore = { [`${start.x},${start.y}`]: 0 };
    const fScore = { [`${start.x},${start.y}`]: heuristic(start, goal) };

    while (openSet.length > 0) {
        let current = openSet.reduce((lowest, node) => {
            const nodeKey = `${node.x},${node.y}`;
            return fScore[nodeKey] < fScore[`${lowest.x},${lowest.y}`] ? node : lowest;
        });

        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet = openSet.filter(node => node !== current);

        const neighbors = getNeighbors(current, gameArea);
        neighbors.forEach(neighbor => {
            const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;
            const neighborKey = `${neighbor.x},${neighbor.y}`;

            if (tentativeGScore < (gScore[neighborKey] || Infinity)) {
                cameFrom[neighborKey] = current;
                gScore[neighborKey] = tentativeGScore;
                fScore[neighborKey] = gScore[neighborKey] + heuristic(neighbor, goal);

                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        });
    }

    return [goal];
}

// Heurística para la búsqueda A*
function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Reconstruir el camino desde el nodo objetivo al nodo inicial
function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom[`${current.x},${current.y}`]) {
        current = cameFrom[`${current.x},${current.y}`];
        totalPath.push(current);
    }
    return totalPath.reverse();
}

// Obtener los vecinos de un nodo en el área de juego
function getNeighbors(node, gameArea) {
    const neighbors = [];
    if (node.x > 0) neighbors.push({ x: node.x - 1, y: node.y });
    if (node.x < gameArea.clientWidth - 1) neighbors.push({ x: node.x + 1, y: node.y });
    if (node.y > 0) neighbors.push({ x: node.x, y: node.y - 1 });
    if (node.y < gameArea.clientHeight - 1) neighbors.push({ x: node.x, y: node.y + 1 });
    return neighbors;
}

// Movimiento Aleatorio Controlado en utils.js
function randomMoveNPC(npc, gameArea) {
    const targetX = Math.random() * (gameArea.clientWidth - npc.clientWidth);
    const targetY = Math.random() * (gameArea.clientHeight - npc.clientHeight);
    const path = findPath({ x: parseInt(npc.style.left), y: parseInt(npc.style.top) }, { x: targetX, y: targetY }, gameArea);
    followPath(path, 0, npc);
}

function followPath(path, index, npc) {
    if (index >= path.length) return;
    const target = path[index];
    npc.style.top = `${target.y}px`;
    npc.style.left = `${target.x}px`;
    setTimeout(() => {
        followPath(path, index + 1, npc);
    }, 1000);
}
