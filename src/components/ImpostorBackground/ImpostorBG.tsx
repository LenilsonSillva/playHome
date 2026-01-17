import React, { useMemo, useRef } from "react";
import styles from "./ImpostorBG.module.css";
import rocket from "../../assets/rocket.png";

// Componente isolado para não sofrer re-renders
// Dentro do SpaceBackground
export const ImpostorBG = React.memo(() => {
  // Pegamos a largura e altura APENAS NA MONTAGEM do componente
  const dims = useRef({
    w: window.screen.width,
    h: window.screen.height,
  });

  const randomPath = useMemo(() => {
    const { w, h } = dims.current;
    const p = () => ({ x: Math.random() * w, y: Math.random() * h });
    const p1 = p();
    const p2 = p();
    const p3 = p();
    const p4 = p();
    return `path("M ${p1.x},${p1.y} C ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y} S ${Math.random() * w},${Math.random() * h} ${p1.x},${p1.y}")`;
  }, []);

  const comets = useMemo(() => {
    return Array.from({ length: 6 }).map((_) => ({
      // Reduzi para 6 para aliviar mobile
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${4 + Math.random() * 6}s`,
      angle: `${-15 + Math.random() * 30}deg`,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.3,
    }));
  }, []);

  return (
    // Usamos dimensões fixas baseadas na tela física, não na janela do navegador
    <div
      className={styles.orbit}
      style={{
        width: dims.current.w,
        height: dims.current.h,
        position: "fixed",
      }}
    >
      {comets.map((c, i) => (
        <div
          key={i}
          className={styles.comet}
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
  );
});
