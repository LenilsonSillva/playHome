import LobbyImportor from "./Lobby";
import React, { useMemo } from "react";
import styles from "./index-impostor.module.css";
import rocket from "../../../../public/rocket.png";

export function Impostor() {
  const randomPath = useMemo(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const p = () => ({ x: Math.random() * w, y: Math.random() * h });
    const p1 = p();
    const p2 = p();
    const p3 = p();
    const p4 = p();
    return `path("M ${p1.x},${p1.y} C ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} S ${Math.random() * w},${Math.random() * h} ${p1.x},${p1.y}")`;
  }, []);

  const comets = useMemo(() => {
    return Array.from({ length: 10 }).map((_) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${2 + Math.random() * 5}s`,
      angle: `${-20 + Math.random() * 40}deg`,
      scale: 0.4 + Math.random() * 1.2,
      opacity: 0.2 + Math.random() * 0.8,
    }));
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.orbit}>
        {comets.map((c, i) => (
          <div
            key={i}
            className={styles.comet}
            // O segredo está no "as React.CSSProperties" ao final do objeto
            style={
              {
                "--left": c.left,
                "--delay": c.delay,
                "--duration": c.duration,
                "--angle": c.angle,
                "--scale": c.scale,
                "--opacity": c.opacity,
              } as React.CSSProperties
            }
          />
        ))}

        <img
          src={rocket}
          alt="Foguete"
          className={styles.spaceship}
          style={{ offsetPath: randomPath } as React.CSSProperties}
        />
      </div>

      <div className={styles.contentWrapper}>
        <LobbyImportor />
      </div>
    </div>
  );
}
