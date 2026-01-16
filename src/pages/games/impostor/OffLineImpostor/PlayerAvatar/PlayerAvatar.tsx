// PlayerAvatar.tsx
import React from "react";
import "./PlayerAvatar.css";

type AvatarProps = {
  emoji: string;
  color: string;
  size?: number;
  hideScan?: boolean;
};

export function PlayerAvatar({
  emoji,
  color,
  size = 40,
  hideScan = false,
}: AvatarProps) {
  const width = size;
  const height = size * 1.33;

  return (
    <div
      style={
        {
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: "4px",
          backgroundColor: "#0a0f1a",
          border: `2px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: `${size * 0.7}px`,
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
        } as React.CSSProperties
      }
    >
      <span style={{ zIndex: 1 }}>{emoji}</span>

      {/* 
         A lógica aqui é: 
         Se hideScan for TRUE, o '!' inverte para FALSE e o componente NÃO renderiza.
         Se hideScan for FALSE (padrão), o '!' inverte para TRUE e o scanner APARECE.
      */}
      {!hideScan && (
        <div
          style={
            {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "3px",
              background: `linear-gradient(to right, transparent, #fff 10%, ${color} 50%, #fff 90%, transparent)`,
              boxShadow: `0 0 10px 1px ${color}`,
              animation: "scanLine 2.5s linear infinite", // O nome aqui deve bater com o CSS
              zIndex: 2,
            } as React.CSSProperties
          }
        />
      )}
    </div>
  );
}
