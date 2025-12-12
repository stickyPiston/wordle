import { useEffect } from 'react';
import { create } from "zustand";
import { combine } from "zustand/middleware";
import './App.css';
import { Link, useParams } from 'react-router';
import puzzles from "./puzzles.json";
import "animate.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowUpRightFromSquare, faDeleteLeft } from '@fortawesome/free-solid-svg-icons';

const useGameStore = create(
  combine({
    id: -1,
    currentWord: "",
    guesses: [] as { guess: string, justAdded: boolean }[],
    currentGuess: "",
    completed: false,
    shake: false
  }, set => ({
    makeGuess: () => set(({ id, guesses, currentGuess, currentWord }) => {
        if (currentGuess === currentWord) {
            const saved = JSON.parse(localStorage.getItem("puzzles") ?? "[]");
            saved.push({ id, tries: guesses.length + 1 });
            localStorage.setItem("puzzles", JSON.stringify(saved));
        }

        if (currentGuess.length !== currentWord.length && guesses.find(guess => guess.guess === currentGuess)) {
            setTimeout(() => set(() => ({ shake: false })), 500);
            return { shake: true };
        }

        const newIndex = guesses.length;
        setTimeout(() => {
            set(({ guesses }) => {
                guesses[newIndex] = { ...guesses[newIndex], justAdded: false };
                return { guesses: [...guesses] };
            })
        }, 1500);

        return {
            id,
            currentWord,
            guesses: [...guesses, { guess: currentGuess, justAdded: true }],
            currentGuess: "",
            completed: currentGuess === currentWord
        };
    }),
    backspaceGuess: () => set(({ currentGuess }) => ({
      currentGuess: currentGuess.slice(0, Math.max(currentGuess.length - 1, 0))
    })),
    addLetterToGuess: (letter: string) => set(({ currentGuess, currentWord }) => ({
      currentGuess: currentGuess.length < currentWord.length ? currentGuess + letter : currentGuess
    })),
    setPuzzle: (id: number) => set(() => ({
      id,
      currentWord: puzzles[id - 1].word,
      guesses: [],
      currentGuess: "",
      completed: false
    })),
  }))
);

function InputLine() {
  const { currentWord, currentGuess, shake, makeGuess, backspaceGuess, addLetterToGuess } = useGameStore();
  const length = currentWord.length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Backspace") 
        return backspaceGuess();
      
      if (e.code === "Enter") {
        return makeGuess();
      }

      if (
        e.key.length === 1
        && 'a' <= e.key.toLowerCase()
        && e.key.toLowerCase() <= 'z'
      ) 
        addLetterToGuess(e.key);
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [currentGuess, currentWord]);

  const guessedLetters = currentGuess.split("");
  const unguessedLetters = Array(length - currentGuess.length).fill("");

  const animation = shake
    ? " animate__animated animate__headShake animate__faster"
    : "";

  return (
    <div className={"guess current" + animation} style={{ gridTemplateColumns: `repeat(${currentWord.length}, 1fr)` }}>
      {guessedLetters.map((letter, _i) => (
        <span className="filled">{letter}</span>
      ))}
      {unguessedLetters.map(_ => (
        <span className="empty"></span>
      ))}
    </div>
  );
}

function Guess({ guess, word, animate }: { guess: string, word: string, animate: boolean }) {
  let correctLetters = word.split("").map((letter, i) => ({ letter, marked: letter === guess[i] }));
  const guessedLetters = guess.split("").map((letter, i) => {
    const correctLetter = word[i];
    if (correctLetter === letter) return { letter, colour: "correct" };
  
    const isYellow = correctLetters.findIndex(({ letter: otherLetter, marked }) => letter === otherLetter && !marked);
    if (isYellow >= 0) {
      correctLetters[isYellow].marked = true;
      return { letter, colour: "present" };
    }

    return { letter, colour: "absent" };
  });

  if (animate) {
    return (
        <div className="guess" style={{ gridTemplateColumns: `repeat(${word.length}, 1fr)` }}>
        {guessedLetters.map(({ letter, colour }, index) => (
            <div className="overlay">
                <span className="empty"></span>
                <span
                    className={`animate__animated animate__flipInX ${colour}`}
                    style={{ animationDelay: `${200 * index}ms` }}
                >{letter}</span>
            </div>
        ))}
        </div>
    );
  } else if (guess === word) {
    return (
        <div className="guess" style={{ gridTemplateColumns: `repeat(${word.length}, 1fr)` }}>
            {guessedLetters.map(({ letter, colour }, index) => (
                <span
                    className={`animate__animated animate__bounce animate__fast ${colour}`}
                    style={{ animationDelay: `${100 * index}ms` }}
                >{letter}</span>
            ))}
        </div>
    );
  } else {
    return (
        <div className="guess" style={{ gridTemplateColumns: `repeat(${word.length}, 1fr)` }}>
            {guessedLetters.map(({ letter, colour }) => (
                <span className={colour}>{letter}</span>
            ))}
        </div>
    );
  }
}

function EmptyGuess({ wordLength }: { wordLength: number }) {
  return (
    <div className="guess" style={{ gridTemplateColumns: `repeat(${wordLength}, 1fr)` }}>
      {Array(wordLength).fill(null).map(() => (
        <span className="empty"></span>
      ))}
    </div>
  );
}

function determineLetterState(letter: string, guesses: string[], word: string) {
    if (guesses.some(guess => guess.includes(letter))) {
        const isCorrect = guesses.some(guess => guess.split("").some((g, i) => g === letter && g === word[i]));
        if (isCorrect) return "correct";

        if (word.includes(letter)) return "present"

        return "absent";
    } else {
        return "empty";
    }
}

function KeyboardRow({ characters, isLast }: { characters: string[], isLast?: boolean }) {
    const { addLetterToGuess, backspaceGuess, makeGuess, guesses, currentWord } = useGameStore();

    return (
        <div>
            {isLast &&
                <span className="wide" onClick={() => makeGuess()}>enter</span>}
            {characters.map(char => (
                <span
                    className={determineLetterState(char, guesses.map(g => g.guess), currentWord)}
                    onClick={() => addLetterToGuess(char)}
                >{char}</span>
            ))}
            {isLast && <span className="wide" onClick={() => backspaceGuess()}>
                <FontAwesomeIcon icon={faDeleteLeft} />
            </span>}
        </div>
    )
}

function Keyboard() {
    return (
        <div className="keyboard">
            <KeyboardRow characters={"qwertyuiop".split("")} />
            <KeyboardRow characters={"asdfghjkl".split("")} />
            <KeyboardRow characters={"zxcvbnm".split("")} isLast />
        </div>
    );
}

export default function Game() {
  const guesses = useGameStore(state => state.guesses);
  const currentWord = useGameStore(state => state.currentWord);
  const setPuzzle = useGameStore(state => state.setPuzzle);
  const completed = useGameStore(state => state.completed);
  const { id: puzzleId } = useParams();

  const puzzleIdNum = Number(puzzleId!);
  if (isNaN(puzzleIdNum) || puzzleIdNum >= puzzles.length) {
    return (
        <>
            <h3>404</h3>
            <p>Onbekende pagina</p>
        </>
    );
  }

  useEffect(() => {
    setPuzzle(Number(puzzleId!));
  }, [puzzleId]);

  return (
    <>
        <nav>
            <Link to="/">
                <h1>Trotcie Wordle</h1>
            </Link>
        </nav>
        <div className="game">
            <div className="guesses" >
                {guesses.slice(completed ? -6 : -5).map(({ guess, justAdded }) => <Guess key={guess} guess={guess} word={currentWord} animate={justAdded} />)}
                {!completed && <InputLine />}
                {Array(Math.max(0, 6 - guesses.length - Number(!completed))).fill(null).map(() => <EmptyGuess wordLength={currentWord.length} />)}
            </div>
            {completed &&
                <div className="buttons">
                    <Link to="/" className="back">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Terug</span>
                    </Link>
                    <Link to="https://forms.gle/ssnm77UJuaDckRKU9" className="join">
                        <span>Kom bij de Trotcie</span>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </Link>
                </div>
            }
        </div>
        {!completed && <Keyboard />}
        </>
    );
}
