import type React from "react";

// Ensures JSX types are available even with a Next-style tsconfig (jsx: preserve)
// in a Vite + React project.
declare global {
  namespace JSX {
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}

export {};
