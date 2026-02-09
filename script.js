const $time = document.querySelector("time");
const $p = document.querySelector("p");
const $input = document.querySelector("input");
const $game = document.querySelector("#game");
const $results = document.querySelector("#results");
const $wpm = $results.querySelector("#results-wpm");
const $accuracy = $results.querySelector("#results-acc");
const $precision = $results.querySelector("#results-precision");
const $button = $results.querySelector("#reload-button");

const INITIAL_TIME = 30;

const TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

let words = [];
let currentTime = INITIAL_TIME;
let inputCount;

start();
initEvents();

function start() {
  $game.style.display = "flex";
  $results.style.display = "none";
  $input.value = "";
  inputCount = 0;

  words = TEXT.split(" ");
  currentTime = INITIAL_TIME;

  $time.textContent = currentTime;
  $p.innerHTML = words
    .map((word, index) => {
      const characters = word.split("");

      return `<word>${characters
        .map((char) => `<char>${char}</char>`)
        .join("")}</word>`;
    })
    .join("");

  $p.querySelector("word").classList.add("active"); //firstWord
  $p.querySelector("char").classList.add("active"); //firstChar

  $time.classList.add("off");
  $time.textContent = `${currentTime} seconds left`;
}

function initEvents() {
  document.addEventListener("keydown", () => {
    $input.focus();
  });

  $input.addEventListener("keydown", onKeyDown);
  $input.addEventListener("input", onInput); // Tried keyup but was wonky when spacing. Flows better with input.
  $button.addEventListener("click", start);
}

function onKeyDown(event) {
  if ($time.classList.contains("off")) {
    $time.classList.remove("off");
    $time.classList.add("on");

    startTimer();
  }

  inputCount++;

  const $currentWord = $p.querySelector("word.active");
  const $currentChar = $currentWord.querySelector("char.active");

  if (event.code === "Space") {
    event.preventDefault(); // dont want the space in the input. go to next word

    const $nextWord = $currentWord.nextElementSibling;
    const $nextChar = $nextWord.querySelector("char");

    $currentWord.classList.remove("active");
    $currentChar.classList.remove("active");

    $nextWord.classList.add("active");
    $nextChar.classList.add("active");

    $input.value = "";

    const missedCharacters =
      $currentWord.querySelectorAll("char:not(.correct)").length > 0;

    const classToAdd = missedCharacters ? "incomplete" : "complete";
    $currentWord.classList.add(classToAdd);

    return;
  }

  if (event.code === "Backspace") {
    const $prevWord = $currentWord.previousElementSibling;
    const $prevChar = $currentChar.previousElementSibling;

    if (!$prevWord && !$prevChar) {
      event.preventDefault();
      return;
    }

    const $incompleteWord = $p.querySelector("word.incomplete");
    if ($incompleteWord && !$prevChar) {
      event.preventDefault();

      $prevWord.classList.remove("incomplete");
      $prevWord.classList.add("active");

      const $targetChar = $prevWord.querySelector("char:last-child");

      $currentChar.classList.remove("active");
      $targetChar.classList.add("active");

      $input.value = [
        ...$prevWord.querySelectorAll("char.correct, char.incorrect"),
      ]
        .map(($el) => {
          return $el.classList.contains("correct") ? $el.textContent : "_";
        })
        .join("");
    }
  }
}

function onInput() {
  const $currentWord = $p.querySelector("word.active");
  const $currentChar = $currentWord.querySelector("char.active");

  const currentWord = $currentWord.textContent.trim();
  $input.maxLength = currentWord.length;

  const $allCharacters = $currentWord.querySelectorAll("char");

  $allCharacters.forEach(($char) =>
    $char.classList.remove("correct", "incorrect"),
  );

  $input.value.split("").forEach((char, index) => {
    const $char = $allCharacters[index];
    const charToCheck = currentWord[index];

    const isCorrect = char === charToCheck;
    const charClass = isCorrect ? "correct" : "incorrect";
    $char.classList.add(charClass);
  });

  $currentChar.classList.remove("active", "is-last");

  const inputLength = $input.value.length;
  const $nextChar = $allCharacters[inputLength];

  if ($nextChar) {
    $nextChar.classList.add("active");
  } else {
    $currentChar.classList.add("active", "is-last");
    // game over if no words left?
  }
}

function startTimer() {
  const interval = setInterval(() => {
    currentTime--;
    setTimer();

    if (currentTime == 0) {
      clearInterval(interval);
      gameOver();
    }
  }, 1000);
}

function setTimer() {
  $time.textContent = `${currentTime} seconds left`;
}

function gameOver() {
  $game.style.display = "none";
  $results.style.display = "flex";

  const correctWords = $p.querySelectorAll("word.complete").length;
  const correctCharacters = $p.querySelectorAll("char.correct").length;
  const incorrectCharacters = $p.querySelectorAll("char.incorrect").length;

  const totalCharacters = correctCharacters + incorrectCharacters;

  const precision =
    totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;

  const accuracy =
    totalCharacters > 0 ? (correctCharacters / inputCount) * 100 : 0;

  const wpm = (correctWords * 60) / INITIAL_TIME;

  $wpm.textContent = wpm;
  $accuracy.textContent = `${accuracy.toFixed(2)}%`;
  $precision.textContent = `${precision.toFixed(2)}%`;
}
