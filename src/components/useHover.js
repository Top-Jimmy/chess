import React, { useRef, useState, useEffect } from 'react';

const useHover = () => {
  const [display, setDisplay] = useState(false);
  const ref = useRef(null);
  const handleMouseOver = () => setDisplay(true);
  const handleMouseOut = () => setDisplay(false);
  useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener("mouseover", handleMouseOver);
        node.addEventListener("mouseout", handleMouseOut);
        return () => {
          node.removeEventListener("mouseover", handleMouseOver);
          node.removeEventListener("mouseout", handleMouseOut);
        };
      }
    },
    [ref.current] // Recall only if ref changes
  );
  return [ref, display];
}

export default useHover