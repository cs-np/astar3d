if (!Array.prototype.remove) {
  Array.prototype.remove = function(from, to) {
    const rest = this.slice((to || from) + 1 || this.length);

    if (from < 0) {
      this.length = this.length + from;
    } else {
      this.length = from;
    }

    return this.push.apply(this, rest);
  };
}

class Node {
  constructor(x, y, z) {

    this.x = x;
    this.y = y;
    this.z = z;

    this.f = 0;
    this.g = 0;
    this.h = 0;

    this.cameFrom = false;
    this.open = false;
    this.closed = false;
    this.path = false;
  }

  clear() {
    this.open = false;
    this.closed = false;
    this.path = false;
    this.f = 0;
    this.h = 0;
    this.g = 0;
    this.cameFrom = false;
  }
}

class AStar {
  constructor(matrix) {
    this.matrix = matrix;
  }

  searchPath(startNode, endNode, options) {
    if (startNode.z < endNode.z) {
      const tmp = endNode;
      endNode = startNode;
      startNode = tmp;
    }
    const openList = [];
    openList.push(startNode);
    startNode.open = true;

    let traversedNodes = 1;

    startNode.g = 0;
    startNode.h = this.heuristic(startNode, endNode, options.heuristic, options.heightFactor);
    startNode.f = startNode.g + startNode.h;

    while (openList.length > 0) {

      const currentIndex = this.getNextIndex(openList);

      const currentNode = openList[currentIndex];

      if (currentNode === endNode) {


        const path = [];
        let aNode = currentNode;

        while (aNode.cameFrom) {
          path.push(aNode);
          aNode.path = true;
          aNode = aNode.cameFrom;
        }
        path.push(startNode);
        startNode.path = true;
        console.log("Traverse Node:", traversedNodes);
        console.log("PATH:", path);
        return {path: path, traversedNodes: traversedNodes};
      }
      traversedNodes++;

      openList.remove(currentIndex);
      currentNode.open = false;
      currentNode.closed = true;

      const neighbors = this.getNeighbors(currentNode, options.diagonal);

      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];

        if (neighbor.closed || neighbor.wall) {
          continue;
        }

        //var tentative_g = currentNode.g + this.distance(currentNode,neighbor);
        const tentative_g = currentNode.g + this.distance(currentNode, neighbor, options.heuristic, options.heightFactor);

        let tentativeIsBetter = false;

        if (!neighbor.open) {
          neighbor.open = true;
          neighbor.h = this.heuristic(neighbor, endNode, options.heuristic);
          openList.push(neighbor);

          tentativeIsBetter = true;
        } else tentativeIsBetter = tentative_g < neighbor.g;

        if (tentativeIsBetter) {
          neighbor.cameFrom = currentNode;
          neighbor.g = tentative_g;
          neighbor.f = neighbor.g + neighbor.h;
        }
      }
    }
    console.log("Traverse Node:", traversedNodes);
    return {path: [], traversedNodes: traversedNodes};
  }

  heuristic(nodeA, nodeB, heuristic) {
    if (heuristic === "manhatten") {
      return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y) + (Math.abs(nodeA.z - nodeB.z));
    } else if (heuristic === "euclidean") {
      return Math.sqrt(Math.pow((nodeA.x - nodeB.x), 2) + Math.pow((nodeA.y - nodeB.y), 2) + (Math.pow((nodeA.z - nodeB.z), 2)));
    }
  };

  distance(nodeA, nodeB, heuristic, heightFactor) {
    if (heuristic === "manhatten") {
      return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y) + (Math.abs(nodeA.z - nodeB.z) * heightFactor);
    } else if (heuristic === "euclidean") {
      return Math.sqrt(Math.pow((nodeA.x - nodeB.x), 2) + Math.pow((nodeA.y - nodeB.y), 2) + (Math.pow((nodeA.z - nodeB.z), 2) * heightFactor));
    }
  };

  getNextNode(openList) {
    let nextNode;
    let minimumF;
    for (let i = 0; i < openList.length; i++) {
      if (openList[i].f < minimumF) {
        minimumF = openList[i].f;
        nextNode = openList[i];
      }
    }
    return nextNode;
  };

  getNextIndex(openList) {
    let nextIndex = 0;
    for (let i = 0; i < openList.length; i++) {
      if (openList[i].f < openList[nextIndex].f) {
        nextIndex = i;
      }
    }
    return nextIndex;
  };

  getNeighbors(aNode, diagonal) {
    let neighbors = [];
    let x = aNode.x;
    let y = aNode.y;
    let z = aNode.z;
    const node = this.matrix;
    //4-Way

    //down
    if (node[x - 1] && node[x - 1][y] && node[x - 1][y][z] && !node[x - 1][y][z + 1]) {
      neighbors.push(node[x - 1][y][z]);
    }

    //up
    if (node[x + 1] && node[x + 1][y] && node[x + 1][y][z] && !node[x + 1][y][z + 1]) {
      neighbors.push(node[x + 1][y][z]);
    }

    //left
    if (node[x] && node[x][y - 1] && node[x][y - 1][z] && !node[x][y - 1][z + 1]) {
      neighbors.push(node[x][y - 1][z]);
    }

    //right
    if (node[x] && node[x][y + 1] && node[x][y + 1][z] && !node[x][y + 1][z + 1]) {
      neighbors.push(node[x][y + 1][z]);
    }

    //bottom down
    if (node[x - 1] && node[x - 1][y] && node[x - 1][y][z - 1] && !node[x - 1][y][z] && !node[x - 1][y][z + 1]) {
      neighbors.push(node[x - 1][y][z - 1]);
    }

    //bottom up
    if (node[x + 1] && node[x + 1][y] && node[x + 1][y][z - 1] && !node[x + 1][y][z] && !node[x + 1][y][z + 1]) {
      neighbors.push(node[x + 1][y][z - 1]);
    }

    //bottom left
    if (node[x] && node[x][y - 1] && node[x][y - 1][z - 1] && !node[x][y - 1][z] && !node[x][y - 1][z + 1]) {
      neighbors.push(node[x][y - 1][z - 1]);
    }

    //bottom right
    if (node[x] && node[x][y + 1] && node[x][y + 1][z - 1] && !node[x][y + 1][z] && !node[x][y + 1][z + 1]) {
      neighbors.push(node[x][y + 1][z - 1]);
    }

    //top down
    if (node[x - 1] && node[x - 1][y] && node[x - 1][y][z + 1] && !node[x - 1][y][z + 2] && !node[x][y][z + 2]) {
      neighbors.push(node[x - 1][y][z + 1]);
    }

    //top up
    if (node[x + 1] && node[x + 1][y] && node[x + 1][y][z + 1] && !node[x + 1][y][z + 2] && !node[x][y][z + 2]) {
      neighbors.push(node[x + 1][y][z + 1]);
    }

    //top left
    if (node[x] && node[x][y - 1] && node[x][y - 1][z + 1] && !node[x][y - 1][z + 2] && !node[x][y][z + 2]) {
      neighbors.push(node[x][y - 1][z + 1]);
    }

    //top right
    if (node[x] && node[x][y + 1] && node[x][y + 1][z + 1] && !node[x][y + 1][z + 2] && !node[x][y][z + 2]) {
      neighbors.push(node[x][y + 1][z + 1]);
    }


    //8-Way
    if (diagonal) {
      //left down
      if (node[x - 1] && node[x - 1][y - 1] && node[x - 1][y - 1][z] && !node[x - 1][y - 1][z + 1]) {
        neighbors.push(node[x - 1][y - 1][z]);
      }

      //left up
      if (node[x + 1] && node[x + 1][y - 1] && node[x + 1][y - 1][z] && !node[x + 1][y - 1][z + 1]) {
        neighbors.push(node[x + 1][y - 1][z]);
      }

      //right down
      if (node[x - 1] && node[x - 1][y + 1] && node[x - 1][y + 1][z] && !node[x - 1][y + 1][z + 1]) {
        neighbors.push(node[x - 1][y + 1][z]);
      }

      //right up
      if (node[x + 1] && node[x + 1][y + 1] && node[x + 1][y + 1][z] && !node[x + 1][y + 1][z + 1]) {
        neighbors.push(node[x + 1][y + 1][z]);
      }

      //bottom left down
      if (node[x - 1] && node[x - 1][y - 1] && node[x - 1][y - 1][z - 1] && !node[x - 1][y - 1][z] && !node[x - 1][y - 1][z + 1]) {
        neighbors.push(node[x - 1][y - 1][z - 1]);
      }

      //bottom left up
      if (node[x + 1] && node[x + 1][y - 1] && node[x + 1][y - 1][z - 1] && !node[x + 1][y - 1][z] && !node[x + 1][y - 1][z + 1]) {
        neighbors.push(node[x + 1][y - 1][z - 1]);
      }

      //bottom right down
      if (node[x - 1] && node[x - 1][y + 1] && node[x - 1][y + 1][z - 1] && !node[x - 1][y + 1][z] && !node[x - 1][y + 1][z + 1]) {
        neighbors.push(node[x - 1][y + 1][z - 1]);
      }

      //bottom right up
      if (node[x + 1] && node[x + 1][y + 1] && node[x + 1][y + 1][z - 1] && !node[x + 1][y + 1][z] && !node[x + 1][y + 1][z + 1]) {
        neighbors.push(node[x + 1][y + 1][z - 1]);
      }

      //top left down
      if (node[x - 1] && node[x - 1][y - 1] && node[x - 1][y - 1][z + 1] && !node[x - 1][y - 1][z + 2] && !node[x][y][z + 2]) {
        neighbors.push(node[x - 1][y - 1][z + 1]);
      }

      //top left up
      if (node[x + 1] && node[x + 1][y - 1] && node[x + 1][y - 1][z + 1] && !node[x + 1][y - 1][z + 2] && !node[x][y][z + 2]) {
        neighbors.push(node[x + 1][y - 1][z + 1]);
      }

      //top right down
      if (node[x - 1] && node[x - 1][y + 1] && node[x - 1][y + 1][z + 1] && !node[x - 1][y + 1][z + 2] && !node[x][y][z + 2]) {
        neighbors.push(node[x - 1][y + 1][z + 1]);
      }

      //top right up
      if (node[x + 1] && node[x + 1][y + 1] && node[x + 1][y + 1][z + 1] && !node[x + 1][y + 1][z + 2] && !node[x][y][z + 2]) {
        neighbors.push(node[x + 1][y + 1][z + 1]);
      }
    }
    return neighbors;
  };
}

const x = 3;
const y = 3;
const z = 3;
const matrix = [];

for (let i = 0; i < x; i++) {
  matrix[i] = [];
  for (let j = 0; j < y; j++) {
    matrix[i][j] = [];
    for (let k = 0; k < z; k++) {
      matrix[i][j][k] = new Node(i, j, k);
    }
  }
}

const astar = new AStar(matrix);

const startNode = matrix[0][0][2];
const endNode = matrix[2][2][2];
const options = {
  heuristic: "manhatten",
  diagonal: false,
  heightFactor: 0.5
};
// Possible values
// heuristic: manhatten or euclidean
// diagonal: true or false
// Height factor: 0.5 ,1 ,5 ,10 ,15 ,20 ,30 ,40 ,50 ,60 ,160
console.log(astar.searchPath(startNode, endNode, options));