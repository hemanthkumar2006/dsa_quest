import { useMemo, useState } from "react";
import { ALL_PATTERNS } from "../data/allPatterns";

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface PostSolveReflectionProps {
  pattern: string;
  isNewGrimoireEntry: boolean;
}

function PostSolveReflection({ pattern, isNewGrimoireEntry }: PostSolveReflectionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => {
    const distractors = shuffled(ALL_PATTERNS.filter((p) => p !== pattern)).slice(0, 3);
    return shuffled([pattern, ...distractors]);
  }, [pattern]);

  return (
    <div data-testid="post-solve-reflection">
      <p>Quick check: which pattern did you just use?</p>
      <ul>
        {options.map((option) => (
          <li key={option}>
            <button
              type="button"
              disabled={selected !== null}
              onClick={() => setSelected(option)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>

      {selected !== null && (
        <div data-testid="reflection-reveal">
          <p>
            {selected === pattern ? "Correct! " : "Not quite. "}
            You just used <strong>{pattern}</strong>.
          </p>
          {isNewGrimoireEntry && <p>New pattern added to your grimoire!</p>}
        </div>
      )}
    </div>
  );
}

export default PostSolveReflection;
