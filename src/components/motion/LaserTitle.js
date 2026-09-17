export default function LaserTitle({ text, enabled = true }) {
  const words = text.trim().split(/\s+/);
  const embers = [
    [4, 76, 0], [12, 38, 540], [21, 68, 180], [31, 24, 760],
    [43, 58, 360], [55, 18, 920], [66, 72, 120], [76, 32, 640],
    [85, 64, 420], [94, 20, 820],
  ];
  let letterIndex = 0;

  return <h1 className={`laser-title${enabled ? ' is-animating' : ''}`} aria-label={text}>
    <span className="title-forge-glow" aria-hidden="true" />
    <span className="title-embers" aria-hidden="true">
      {embers.map(([left, rise, delay], index) => <i key={index} style={{ '--ember-left': `${left}%`, '--ember-y': `-${rise}px`, '--ember-delay': `${delay}ms` }} />)}
    </span>
    {words.map((word, wordIndex) => <span className="laser-word" aria-hidden="true" key={`${word}-${wordIndex}`}>
      {[...word].map((letter) => {
        const index = letterIndex;
        letterIndex += 1;
        return <span className="laser-letter" style={{ '--letter-index': index, '--letter-delay': `${320 + index * 450}ms` }} key={`${letter}-${index}`}>
          {letter}
        </span>;
      })}
    </span>)}
  </h1>;
}
