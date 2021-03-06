import React, {useState, useEffect} from "react";
import {useInterval, range} from "./utils";
import "./SnakeBoard.css";

const SnakeBoard = ({points, setPoints}) => {
  const [height, setHeight] = useState(
    parseInt(localStorage.getItem("snake-board-size")) || 10
  );
  const [width, setWidth] = useState(
    parseInt(localStorage.getItem("snake-board-size")) || 10
  );
  const getInitialRows = () => {
    var initialRows = [];
    for (var i = 0; i < height; i++) {
      initialRows[i] = [];
      for (var j = 0; j < width; j++) {
        initialRows[i][j] = "blank";
      }
    }
    return initialRows;
  };
  const getObstacles = () => [
    {name: "tyhjä", location: []},
    {
      name: "keski",
      location: range(width * 0.6).map(y => ({
        x: Math.round(height / 2),
        y: y + Math.ceil(width * 0.2)
      }))
    },
    {
      name: "reunat",
      location: [
        ...range(width).map(x => ({x, y: 0})),
        ...range(width).map(x => ({x, y: height - 1})),
        ...range(height).map(y => ({x: 0, y})),
        ...range(height).map(y => ({x: height - 1, y}))
      ]
    },
    {
      name: "oma",
      location: [
        {x: 2, y: 2},
        {x: 3, y: 2},
        {x: 4, y: 2},
        {x: 5, y: 3},
        {x: 6, y: 3},
        {x: 7, y: 3},
        {x: 8, y: 4},
        {x: 8, y: 5},
        {x: 7, y: 6},
        {x: 6, y: 6},
        {x: 5, y: 6},
        {x: 4, y: 7},
        {x: 3, y: 7},
        {x: 2, y: 7}
      ]
    }
  ];
  const randomObstacle = () =>
    getObstacles()[Math.floor(Math.random() * getObstacles.length)];
  //     obstacles[Math.floor(Math.random() * obstacles.length)];
  // Satunnainen sijainti x ja y -koordinaatistossa

  const randomPosition = () => {
    const position = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height)
    };
    if (
      obstacle.location.some(({x, y}) => position.x === x && position.y === y)
    ) {
      return randomPosition();
    }
    return position;
  };

  /*
  Reactin statea voi käyttää Hookien avulla myös tällaisissa luokattomissa
  komponenteissa. https://joinex.fi/react-pahkinankuoressa/
  */
  // Rows eli rivit merkitsee tässä pelilaudan rivejä

  const [obstacle, setObstacle] = useState(randomObstacle());
  const [rows, setRows] = useState(getInitialRows);
  // Lisätään mato. Mato on lista objekteja, joihin tallennetaan madon osien x ja y -sijainnit.
  // Alustetaan madon pään sijainniksi {x:0, y:0}
  const [snake, setSnake] = useState([{x: 1, y: 1}]);
  // Alustetaan madon suunnaksi oikealle
  const [direction, setDirection] = useState("right");
  // Käytetään randomPosition funktiota alustamaan ruuan sijainti kun mato syö ruuan
  const [food, setFood] = useState(randomPosition);
  // Tallennetaan interval id stateen, jotta sen voi pelin loppuessa pysäyttää
  const [intervalId, setIntervalId] = useState();
  const [isGameOver, setIsGameOver] = useState(false);
  const [startGame, setStartGame] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (width >= 10 && (width <= 100) & (height >= 10) && height <= 100) {
      setObstacle(randomObstacle());
      setRows(getInitialRows());
      setFood(randomPosition());
    }
  }, [width, height]);

  const changeDirectionWithKeys = e => {
    var {keyCode} = e;
    switch (keyCode) {
      case 37:
        setDirection("left");
        break;
      case 38:
        setDirection("top");
        break;
      case 39:
        setDirection("right");
        break;
      case 40:
        setDirection("bottom");
        break;
      default:
        break;
    }
  };
  document.addEventListener("keydown", changeDirectionWithKeys, false);

  // Tässä kohdassa tehdään kaksiulotteisesta taulukosta näkyvä versio pelikentästä
  const displayRows = rows.map((row, i) => (
    <div className="Snake-row" key={i}>
      {row.map((tile, j) => (
        <div className={`tile ${tile}`} key={j} />
      ))}
    </div>
  ));

  // Asetetaan mato pelilaudalle madon x ja y -sijaintien mukaisesti
  // Asetetaan samalla myös ruoka pelilaudalle (x,y)
  const displaySnake = () => {
    const newRows = getInitialRows();
    snake.forEach(tile => {
      newRows[tile.x][tile.y] = "snake";
    });
    newRows[food.x][food.y] = "food";
    obstacle.location.forEach(tile => {
      newRows[tile.x][tile.y] = "obstacle";
    });

    setRows(newRows);
  };

  // Tarkistetaan onko mato osunut itseensä
  const checkGameOver = () => {
    const head = snake[0];
    const body = snake.slice(1, -1);
    const hitSnake = body.find(b => b.x === head.x && b.y === head.y);

    const hitWall = obstacle.location.some(
      ({x, y}) => head.x === x && head.y === y
    );
    return hitSnake || hitWall;
  };

  // Liikutetaan matoa haluttuun suuntaan
  const moveSnake = () => {
    if (!startGame) return;
    const newSnake = [];
    switch (direction) {
      // Jakojäännös (%) tarkoittaa jakolaskussa yli jäävää kokonaislukua.
      // Esimerkiksi jos luku 17 jaetaan luvulla 5, jakojäännös on 2, koska 3 · 5 = 15, mutta 2 jää yli.
      // snake[0] on madon ensimmäinen osa eli pää
      case "right":
        // x pysyy samana, y menee yhden askeleen oikealle eli plus yksi
        newSnake.push({x: snake[0].x, y: (snake[0].y + 1) % width});
        break;
      case "left":
        // x pysyy samana, y menee yhden askeleen vasemmalle eli miinus yksi
        newSnake.push({x: snake[0].x, y: (snake[0].y - 1 + width) % width});
        break;
      case "top":
        // x menee yhden askeleen ylöspäin eli miinus yksi, y pysyy samana
        newSnake.push({x: (snake[0].x - 1 + height) % height, y: snake[0].y});
        break;
      case "bottom":
        // x menee yhden askeleen alaspäin eli plus yksi, y pysyy samana
        newSnake.push({x: (snake[0].x + 1) % height, y: snake[0].y});
        break;
      default:
        break;
    }

    if (checkGameOver()) {
      setIsGameOver(true);
      // Pysäytä madon liikkumisen intervalli
      clearInterval(intervalId);
      // Lisää pisteet local storageen tulostaulukkoa varten
      // HUOM! Local storage hyväksyy vain JSON:ia
      const pointsList = JSON.parse(localStorage.getItem("snake-points")) || [];
      const name = prompt("Peli päättyi! Anna pelimerkkisi!");
      pointsList.push({name, points});
      localStorage.setItem("snake-points", JSON.stringify(pointsList));
      window.dispatchEvent(new Event("storage"));
    }

    // Lisätään madolle joka intervallilla / "askeleella" uusi pala
    snake.forEach(tile => {
      newSnake.push(tile);
    });

    // Vaihdetaan ruuan sijaintia jos mato syö ruuan.
    if (snake[0].x === food.x && snake[0].y === food.y) {
      setFood(randomPosition);
      setPoints(points + 1);
    } else {
      // Jos mato ei syö ruokaa, poistetaan viimeinen hännän pala,
      // jottei mato kasva joka askeleella, vaan vain silloin kun se saa ruuan kiinni!
      newSnake.pop();
    }

    setSnake(newSnake);
    displaySnake();
  };

  // Käytetään kustomoitua intervalli-funktiota madon liikuttamiseen
  useInterval(moveSnake, 250, setIntervalId);

  return (
    <div className="Snake-board">
      {!startGame && (
        <>
          <div>Pelilaudan koko on nyt {width} ruutua.</div>
          <div>Aseta halutessasi uusi pelilaudan koko:</div>
          <input
            className="Board-size"
            placeholder="Koko 10-100 (suositus 10-35)"
            type="number"
            onChange={e => {
              const size = parseInt(e.target.value);
              if (size <= 100 && size >= 10) {
                console.log("OK", size);
                setWidth(size);
                setHeight(size);
                localStorage.setItem("snake-board-size", size);
                setError(null);
              } else {
                console.error("ei hyvä", size);
                setError(
                  `Pelilaudan koko on liian ${size > 100 ? "suuri" : "pieni"}`
                );
              }
            }}
          />
          {error && <div className="Error">{error}</div>}
          <button className="Start-game" onClick={setStartGame}>
            Aloita peli!
          </button>
        </>
      )}
      {(startGame, displayRows)}
      {isGameOver && <div className="Game-over">Game over!</div>}
    </div>
  );
};

export default SnakeBoard;
