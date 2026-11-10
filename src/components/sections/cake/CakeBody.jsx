import './cake.css';

/**
 * The cake itself: two burgundy tiers, blush frosting with drips, gold
 * sprinkles, a glass plate. Built entirely from CSS so it stays razor sharp on
 * any screen and costs nothing to load.
 */
export function CakeBody({ litCount = 0 }) {
  const glowing = litCount > 0;

  return (
    <div className={`cake ${glowing ? 'is-lit' : 'is-resting'}`.trim()} aria-hidden="true">
      <span className="cake__aura" />

      <div className="cake__tier cake__tier--top">
        <span className="cake__frost">
          <span className="cake__drips" />
        </span>
        <span className="cake__sprinkles cake__sprinkles--a" />
        <span className="cake__sprinkles cake__sprinkles--b" />
      </div>

      <div className="cake__tier cake__tier--bottom">
        <span className="cake__frost">
          <span className="cake__drips" />
        </span>
        <span className="cake__sprinkles cake__sprinkles--c" />
        <span className="cake__line" />
      </div>

      <span className="cake__plate" />
      <span className="cake__shadow" />
    </div>
  );
}

export default CakeBody;
