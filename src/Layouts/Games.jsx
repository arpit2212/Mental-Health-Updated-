import { useState } from 'react';
import { 
  Layout, 
  Grid, 
  Target, 
  Puzzle, 
  Shuffle, 
  Brain, 
  Menu, 
  X, 
  RotateCw,
  CheckCircle2
} from 'lucide-react';

const GamesHub = () => {
  const [activeGame, setActiveGame] = useState(null);
  
  // Game components
  const games = [
    {
      id: 'memory',
      name: 'Memory Match',
      icon: <Brain className="h-8 w-8" />,
      color: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
      component: <MemoryGame />
    },
    {
      id: 'colorGuess',
      name: 'Color Guess',
      icon: <Target className="h-8 w-8" />,
      color: 'bg-pink-100 hover:bg-pink-200 text-pink-800',
      component: <ColorGuessGame />
    },
    {
      id: 'tileSlide',
      name: 'Tile Slide',
      icon: <Grid className="h-8 w-8" />,
      color: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
      component: <TileSlideGame />
    },
    {
      id: 'wordScramble',
      name: 'Word Scramble',
      icon: <Shuffle className="h-8 w-8" />,
      color: 'bg-green-100 hover:bg-green-200 text-green-800',
      component: <WordScrambleGame />
    },
    {
      id: 'patternMatch',
      name: 'Pattern Match',
      icon: <Puzzle className="h-8 w-8" />,
      color: 'bg-orange-100 hover:bg-orange-200 text-orange-800',
      component: <PatternMatchGame />
    }
  ];

  return (
    <div className="min-h-screen bg-[#dce1e3] ">
      {/* Header */}
      <header className=" text-teal-500 bg-[#dce1e3] p-6 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Layout className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Mind Relaxing Games</h1>
          </div>
          
          {activeGame && (
            <button 
              onClick={() => setActiveGame(null)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Menu size={18} />
              <span>Games Menu</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {!activeGame ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-8 text-center">
              Choose a game to play
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className={`${game.color} p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center space-y-4 h-48`}
                >
                  {game.icon}
                  <span className="text-lg font-medium">{game.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                {games.find(g => g.id === activeGame)?.name}
              </h2>
              <button
                onClick={() => setActiveGame(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <X size={18} />
                <span>Close Game</span>
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              {games.find(g => g.id === activeGame)?.component}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 py-6 bg-gray-100 text-center text-gray-600">
        <p>Mind Relaxing Games Hub © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

// Game 1: Memory Match
const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const emojis = ['🌟', '🎮', '🍕', '🚀', '🎵', '🎨', '🌈', '🍦'];
  
  const initializeGame = () => {
    // Create pairs of cards
    const cardPairs = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        content: emoji,
        flipped: false,
        solved: false
      }));
      
    setCards(cardPairs);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setGameStarted(true);
  };
  
  const handleCardClick = (id) => {
    // Ignore click if the card is already flipped or solved
    if (flipped.includes(id) || solved.includes(id)) return;
    
    // Don't allow more than 2 cards flipped at once
    if (flipped.length === 2) return;
    
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    // If two cards are flipped, check if they match
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      
      if (firstCard.content === secondCard.content) {
        // Cards match
        setSolved(s => [...s, firstId, secondId]);
        setFlipped([]);
      } else {
        // Cards don't match, flip back after delay
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };
  
  const isGameComplete = solved.length === cards.length && cards.length > 0;

  return (
    <div className="flex flex-col items-center justify-center">
      {!gameStarted ? (
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Flip cards to find matching pairs. Remember the positions and match all pairs with the fewest moves!
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full mb-4">
            <p className="text-gray-600">Moves: {moves}</p>
            <button
              onClick={initializeGame}
              className="flex items-center text-purple-600 hover:text-purple-800"
            >
              <RotateCw size={16} className="mr-1" />
              Restart
            </button>
          </div>
          
          {isGameComplete ? (
            <div className="text-center my-6">
              <div className="flex justify-center mb-3 text-4xl">🎉</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Congratulations!</h3>
              <p className="text-gray-600">You completed the game in {moves} moves.</p>
              <button
                onClick={initializeGame}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {cards.map(card => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg cursor-pointer text-2xl
                    ${flipped.includes(card.id) || solved.includes(card.id) 
                      ? 'bg-purple-100 shadow-md rotate-y-180' 
                      : 'bg-purple-600 text-transparent hover:bg-purple-700'}
                    ${solved.includes(card.id) ? 'bg-green-100 text-green-600' : ''}
                    transition-all duration-300
                  `}
                >
                  {(flipped.includes(card.id) || solved.includes(card.id)) ? card.content : '?'}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Game 2: Color Guess
const ColorGuessGame = () => {
  const [targetColor, setTargetColor] = useState('');
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const startGame = () => {
    generateNewRound();
    setScore(0);
    setFeedback(null);
    setGameStarted(true);
  };
  
  const generateNewRound = () => {
    const correctColor = generateRandomColor();
    const optionsList = [correctColor];
    
    // Generate 2 more random colors
    while (optionsList.length < 3) {
      const color = generateRandomColor();
      if (!optionsList.includes(color)) {
        optionsList.push(color);
      }
    }
    
    // Shuffle options
    const shuffledOptions = optionsList.sort(() => Math.random() - 0.5);
    
    setTargetColor(correctColor);
    setOptions(shuffledOptions);
    setFeedback(null);
  };
  
  const handleColorSelect = (color) => {
    if (color === targetColor) {
      setScore(s => s + 1);
      setFeedback({ correct: true, message: 'Correct!' });
      
      // Generate new round after delay
      setTimeout(() => {
        generateNewRound();
      }, 1000);
    } else {
      setFeedback({ correct: false, message: 'Wrong! Try again.' });
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Test your color perception! Look at the color and select the matching RGB code from the options below.
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full mb-6">
            <p className="text-gray-600">Score: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center text-pink-600 hover:text-pink-800"
            >
              <RotateCw size={16} className="mr-1" />
              Restart
            </button>
          </div>
          
          <div 
            className="w-32 h-32 md:w-40 md:h-40 rounded-lg shadow-md mb-6"
            style={{ backgroundColor: targetColor }}
          ></div>
          
          <p className="mb-4 text-gray-700">Select the matching RGB code:</p>
          
          <div className="grid grid-cols-1 gap-3 w-full max-w-md">
            {options.map((color, index) => (
              <button
                key={index}
                onClick={() => handleColorSelect(color)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-800 text-left transition-colors"
              >
                {color}
              </button>
            ))}
          </div>
          
          {feedback && (
            <div className={`mt-6 p-3 rounded-lg ${feedback.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {feedback.message}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Game 3: Tile Slide
const TileSlideGame = () => {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const gridSize = 3; // 3x3 grid
  
  const initializeGame = () => {
    // Create tiles 1-8 and empty space (represented as null)
    let initialTiles = Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1);
    initialTiles.push(null); // Empty space
    
    // Shuffle tiles (ensure it's solvable)
    do {
      initialTiles.sort(() => Math.random() - 0.5);
    } while (!isSolvable(initialTiles));
    
    setTiles(initialTiles);
    setMoves(0);
    setIsComplete(false);
    setGameStarted(true);
  };
  
  // Check if the puzzle is solvable (simplified version)
  const isSolvable = (tiles) => {
    // For 3x3 puzzles, count inversions
    let inversions = 0;
    const tilesWithoutEmpty = tiles.filter(t => t !== null);
    
    for (let i = 0; i < tilesWithoutEmpty.length - 1; i++) {
      for (let j = i + 1; j < tilesWithoutEmpty.length; j++) {
        if (tilesWithoutEmpty[i] > tilesWithoutEmpty[j]) {
          inversions++;
        }
      }
    }
    
    // For 3x3 grid, if inversions is even, puzzle is solvable
    return inversions % 2 === 0;
  };
  
  // Check if puzzle is solved
  const checkCompletion = (currentTiles) => {
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i] !== i + 1) {
        return false;
      }
    }
    return currentTiles[currentTiles.length - 1] === null;
  };
  
  const handleTileClick = (index) => {
    if (isComplete) return;
    
    const emptyIndex = tiles.indexOf(null);
    
    // Check if the clicked tile is adjacent to the empty space
    const isAdjacent = (
      // Same row, adjacent column
      (Math.floor(index / gridSize) === Math.floor(emptyIndex / gridSize) && 
       Math.abs(index % gridSize - emptyIndex % gridSize) === 1) ||
      // Same column, adjacent row
      (index % gridSize === emptyIndex % gridSize && 
       Math.abs(Math.floor(index / gridSize) - Math.floor(emptyIndex / gridSize)) === 1)
    );
    
    if (isAdjacent) {
      // Swap tiles
      const newTiles = [...tiles];
      newTiles[emptyIndex] = tiles[index];
      newTiles[index] = null;
      
      setTiles(newTiles);
      setMoves(moves + 1);
      
      // Check if the puzzle is solved
      if (checkCompletion(newTiles)) {
        setIsComplete(true);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Slide the numbered tiles to arrange them in order from 1 to 8, with the empty space in the bottom right corner.
          </p>
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full mb-6">
            <p className="text-gray-600">Moves: {moves}</p>
            <button
              onClick={initializeGame}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <RotateCw size={16} className="mr-1" />
              Restart
            </button>
          </div>
          
          {isComplete ? (
            <div className="text-center my-6">
              <div className="flex justify-center mb-3 text-4xl">🎉</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Puzzle Complete!</h3>
              <p className="text-gray-600">You solved it in {moves} moves.</p>
              <button
                onClick={initializeGame}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div 
              className="grid gap-1 bg-blue-800 p-1 rounded-lg"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: 'fit-content'
              }}
            >
              {tiles.map((tile, index) => (
                <div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`
                    w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded
                    ${tile === null ? 'bg-blue-800' : 'bg-blue-100 hover:bg-blue-200 cursor-pointer'}
                    text-xl font-bold transition-colors
                  `}
                >
                  {tile !== null && tile}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Game 4: Word Scramble
const WordScrambleGame = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  
  const words = [
    'RELAX', 'PEACE', 'CALM', 'HAPPY', 'FOCUS', 
    'MIND', 'BRAIN', 'SMART', 'THINK', 'DREAM',
    'GAME', 'PLAY', 'FUN', 'JOY', 'SMILE'
  ];
  
  const scrambleWord = (word) => {
    return word
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  };
  
  const startGame = () => {
    selectRandomWord();
    setScore(0);
    setFeedback(null);
    setUserGuess('');
    setGameStarted(true);
  };
  
  const selectRandomWord = () => {
    let randomWord = words[Math.floor(Math.random() * words.length)];
    let scrambled = scrambleWord(randomWord);
    
    // Ensure the scrambled word is different from the original
    while (scrambled === randomWord) {
      scrambled = scrambleWord(randomWord);
    }
    
    setCurrentWord(randomWord);
    setScrambledWord(scrambled);
    setUserGuess('');
    setFeedback(null);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (userGuess.toUpperCase() === currentWord) {
      setFeedback({ correct: true, message: 'Correct!' });
      setScore(s => s + 1);
      
      // Select a new word after a delay
      setTimeout(() => {
        selectRandomWord();
      }, 1500);
    } else {
      setFeedback({ correct: false, message: `Incorrect. Try again!` });
    }
  };
  
  const skipWord = () => {
    setFeedback({ correct: false, message: `The word was ${currentWord}` });
    
    // Select a new word after a delay
    setTimeout(() => {
      selectRandomWord();
    }, 1500);
  };
  
  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Unscramble the letters to form a valid word. Type your answer and submit to check!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full mb-6">
            <p className="text-gray-600">Score: {score}</p>
            <button
              onClick={startGame}
              className="flex items-center text-green-600 hover:text-green-800"
            >
              <RotateCw size={16} className="mr-1" />
              Restart
            </button>
          </div>
          
          <div className="text-3xl font-bold mb-6 tracking-widest text-green-700">
            {scrambledWord}
          </div>
          
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex mb-4">
              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="Your answer"
                className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-3 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors"
              >
                Submit
              </button>
            </div>
            
            <button
              type="button"
              onClick={skipWord}
              className="w-full py-2 text-green-600 hover:text-green-800"
            >
              Skip this word
            </button>
          </form>
          
          {feedback && (
            <div className={`mt-6 p-3 rounded-lg w-full max-w-md text-center ${feedback.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {feedback.message}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Game 5: Pattern Match
const PatternMatchGame = () => {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, showing, input, success, failure
  const [gameStarted, setGameStarted] = useState(false);
  
  const colors = ['red', 'blue', 'green', 'yellow'];
  
  const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
  };
  
  const activeColorClasses = {
    red: 'bg-red-300',
    blue: 'bg-blue-300',
    green: 'bg-green-300',
    yellow: 'bg-yellow-300',
  };
  
  const startGame = () => {
    setPattern([]);
    setUserPattern([]);
    setLevel(1);
    setGameStatus('waiting');
    setGameStarted(true);
    
    // Start first round after a short delay
    setTimeout(() => {
      startNextLevel();
    }, 1000);
  };
  
  const startNextLevel = () => {
    // Generate a new pattern based on the current level
    const newPattern = [];
    for (let i = 0; i < level; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      newPattern.push(randomColor);
    }
    
    setPattern(newPattern);
    setUserPattern([]);
    setGameStatus('showing');
    setIsShowingPattern(true);
    
    // Show the pattern with timing
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= newPattern.length) {
        clearInterval(interval);
        setIsShowingPattern(false);
        setGameStatus('input');
      } else {
        // Flash the color
        setIsShowingPattern(true);
        setTimeout(() => {
          currentIndex++;
          if (currentIndex < newPattern.length) {
            setIsShowingPattern(true);
          }
        }, 600);
      }
    }, 1000);
  };
  
  const handleColorClick = (color) => {
    if (gameStatus !== 'input') return;
    
    const newUserPattern = [...userPattern, color];
    setUserPattern(newUserPattern);
    
    // Check if the user's pattern is correct so far
    const isCorrectSoFar = newUserPattern.every((c, i) => c === pattern[i]);
    
    if (!isCorrectSoFar) {
      // Pattern is incorrect
      setGameStatus('failure');
      return;
    }
    
    if (newUserPattern.length === pattern.length) {
      // User completed the pattern successfully
      setGameStatus('success');
      
      // Move to next level after delay
      setTimeout(() => {
        setLevel(level + 1);
        startNextLevel();
      }, 1500);
    }
  };
  
  // Get the active color for showing the pattern
  const getActiveColor = () => {
    if (isShowingPattern && pattern.length > 0) {
      const currentIndex = userPattern.length;
      return pattern[currentIndex];
    }
    return null;
  };
  
  const activeColor = getActiveColor();
  
  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            Watch the pattern of colors and repeat it in the same sequence. Each level adds one more step to remember!
          </p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-between w-full mb-6">
            <p className="text-gray-600">Level: {level}</p>
            <div className="flex items-center space-x-2">
              <span className={`inline-block w-3 h-3 rounded-full ${
                gameStatus === 'showing' ? 'bg-yellow-500' :
                gameStatus === 'input' ? 'bg-green-500' :
                gameStatus === 'success' ? 'bg-blue-500' :
                gameStatus === 'failure' ? 'bg-red-500' : 'bg-gray-500'
              }`}></span>
              <span className="text-gray-600">
                {gameStatus === 'showing' ? 'Watch...' :
                 gameStatus === 'input' ? 'Your turn!' :
                 gameStatus === 'success' ? 'Correct!' :
                 gameStatus === 'failure' ? 'Incorrect!' : 'Ready'}
              </span>
            </div>
            <button
              onClick={startGame}
              className="flex items-center text-orange-600 hover:text-orange-800"
            >
              <RotateCw size={16} className="mr-1" />
              Restart
            </button>
          </div>
          
          {gameStatus === 'failure' ? (
            <div className="text-center my-6">
              <div className="text-4xl mb-3">😢</div>
              <h3 className="text-xl font-bold text-red-600 mb-2">Game Over!</h3>
              <p className="text-gray-600">You reached level {level}.</p>
              <button
                onClick={startGame}
                className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  disabled={gameStatus !== 'input'}
                  className={`
                    w-32 h-32 rounded-lg transition-all duration-200
                    ${activeColor === color ? activeColorClasses[color] : colorClasses[color]}
                    ${gameStatus !== 'input' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                ></button>
              ))}
            </div>
          )}
          
          {gameStatus === 'input' && (
            <div className="mt-6 flex items-center">
              <p className="text-gray-600 mr-2">Progress:</p>
              <div className="flex space-x-1">
                {pattern.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < userPattern.length ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GamesHub;