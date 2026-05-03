import { useState, MouseEvent } from 'react';
import './HoverMagnifier.css';

interface HoverMagnifierProps {
  src: string;
  alt: string;
  zoom?: number;
}

const HoverMagnifier = ({ src, alt, zoom = 2 }: HoverMagnifierProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setPosition({ x, y });
    setCursorPosition({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div
      className="hover-magnifier-container"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <img src={src} alt={alt} className="magnifier-base-img" />

      {showMagnifier && (
        <div
          className="magnifier-lens"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: `${position.x}% ${position.y}%`,
            backgroundSize: `${zoom * 100}%`,
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
          }}
        />
      )}
    </div>
  );
};

export default HoverMagnifier;
