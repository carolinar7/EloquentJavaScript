var roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}

var roadGraph = buildGraph(roads);

var VillageState = class VillageState {
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }

  move(destination) {
    if (!roadGraph[this.place].includes(destination)) {
      return this;
    } else {
      let parcels = this.parcels.map(p => {
        if (p.place != this.place) return p;
        return {place: destination, address: p.address};
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

function runRobot(state, robot, memory, log = false) {
  let turn;
  for (turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      log && console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    state = state.move(action.direction);
    memory = action.memory;
    log && console.log(`Moved to ${action.direction}`);
  }
  return turn
}

function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
};

var mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}

function findRoute(graph, from, to) {
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

// Measuring a robot. There are three kinds of robots.
// 1. Random robot
// 2. Route robot
// 3. Goal oriented robot

function compareRobots(robot1, memory1, robot2, memory2, log = false) {
  const RUNS = 100
  let robot1TotalSteps = 0
  let robot2TotalSteps = 0
  for (let i = 0; i < RUNS; i++) {
    const villageState = VillageState.random();
    robot1TotalSteps += runRobot(villageState, robot1, memory1, log)
    robot2TotalSteps += runRobot(villageState, robot2, memory2, log)
  }
  console.log(`Average steps for ${robot1.name} is ${robot1TotalSteps / RUNS}`)
  console.log(`Average steps for ${robot2.name} is ${robot2TotalSteps / RUNS}\n`)
}

compareRobots(randomRobot, [], routeRobot, [])
compareRobots(randomRobot, [], goalOrientedRobot, [])
compareRobots(routeRobot, [], goalOrientedRobot, [])

function nearestParcelPickup({place, parcels}) {
  let route = findRoute(roadGraph, place, parcels[0].place)
  for (let i = 1; i < parcels.length; i++) {
    possibleRoute = findRoute(roadGraph, place, parcels[i].place)
    route = (possibleRoute.length < route.length) ? possibleRoute : route
  }
  return route
}

function nearestParcelDelivery({place, parcels}) {
  let route = findRoute(roadGraph, place, parcels[0].address)
  for (let i = 1; i < parcels.length; i++) {
    possibleRoute = findRoute(roadGraph, place, parcels[i].address)
    route = (possibleRoute.length < route.length) ? possibleRoute : route
  }
  return route
}

function efficientRobot({place, parcels}, route) {
  const obtainedParcels = parcels.filter((parcel) => parcel.place === place)
  const needToPickupParcels = parcels.filter((parcel) => parcel.place !== place)

  if (obtainedParcels.length > 0)
    route = nearestParcelDelivery({place, parcels: obtainedParcels})

  if (needToPickupParcels.length > 0)
    route = nearestParcelPickup({place, parcels: needToPickupParcels})

  return {direction: route[0], memory: route.slice(1)};
}

compareRobots(goalOrientedRobot, [], efficientRobot, [])