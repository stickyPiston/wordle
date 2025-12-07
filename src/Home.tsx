import puzzles from "./puzzles.json";
import { Link } from "react-router";
import './App.css';

export default function Home() {
  const saved = JSON.parse(localStorage.getItem("puzzles") ?? "[]") as { id: number, tries: number }[];
  const enumeratedPuzzles = puzzles.map((puzzle, i) => ({
    ...puzzle,
    id: i + 1,
    tries: saved.find(p => p.id === i + 1)?.tries
  }));

  return (
    <>
        <nav>
            <h1>Trotcie Wordle</h1>
        </nav>
        <ul className="puzzles">
            {enumeratedPuzzles.map(puzzle => (
                <li className={puzzle.tries ? "completed" : ""}>
                    <Link to={`/${puzzle.id}`}>
                        <h3>Puzzel #{puzzle.id}</h3>
                        <span>{puzzle.tries ? `Opgelost in ${puzzle.tries} keer raden` : "Onopgelost"}</span>
                    </Link>
                </li>
            ))}
        </ul>
    </>
  )
}
