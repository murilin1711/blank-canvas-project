/// <reference types="react" />
/// <reference types="react-dom" />

// Global JSX namespace declaration for Vite + React projects
declare global {
  namespace JSX {
    type Element = React.ReactElement<any, any>;
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    type IntrinsicElements = React.JSX.IntrinsicElements;
  }
}

export {};
