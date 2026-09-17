export default function LaserTitle({ text, enabled = true }) {
  const words = text.trim().split(/\s+/);
  let letterIndex = 0;

  return <h1 className={`laser-title${enabled ? ' is-animating' : ''}`} aria-label={text}>
    {words.map((word, wordIndex) => <span className="laser-word" aria-hidden="true" key={`${word}-${wordIndex}`}>
      {[...word].map((letter) => {
        const index = letterIndex;
        letterIndex += 1;
        return <span className="laser-letter" style={{ '--letter-index': index, '--letter-delay': `${220 + index * 105}ms` }} key={`${letter}-${index}`}>
          {letter}
        </span>;
      })}
    </span>)}
  </h1>;
}
