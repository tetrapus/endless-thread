import * as React from "react";

type Coordinate = {
  x: number;
  y: number;
};

type State = {
  path: ReadonlyArray<Coordinate>;
};

type Props = {
  initial?: Coordinate;
};

class EndlessThread extends React.Component<Props, State> {
  svgRef: React.RefObject<SVGSVGElement>;
  timer?: NodeJS.Timeout;
  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      path: []
    };
    this.svgRef = React.createRef();
  }

  componentDidMount() {
    if (!this.svgRef.current) {
      throw Error("No host element to bind");
    }
    const hostDimensions = this.svgRef.current.getClientRects()[0];
    const bounds = {
      x: [0, hostDimensions.width] as [number, number],
      y: [0, hostDimensions.height] as [number, number]
    };
    const randint = (max: number) => Math.floor(Math.random() * max);
    const clip = (n: number, [min, max]: [number, number]) =>
      Math.min(max, Math.max(min, n));
    this.setState({
      path: [
        this.props.initial || {
          x: clip(randint(hostDimensions.width), bounds.x),
          y: clip(randint(hostDimensions.height), bounds.y)
        }
      ]
    });
    this.timer = setInterval(async () => {
      const path = this.state.path;
      const last = path[path.length - 1];
      this.setState({
        path: [
          ...path,
          {
            x: clip(last.x + randint(21) - 10, bounds.x),
            y: clip(last.y + randint(21) - 10, bounds.y)
          }
        ]
      });
    }, 75);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  render() {
    const path = this.state.path;
    return (
      <svg
        style={{
          position: "fixed",
          height: "100%",
          width: "100%",
          opacity: 0.6,
          zIndex: -1
        }}
        ref={this.svgRef}
      >
        {path.length && (
          <path
            d={`M${path[0].x} ${path[0].y} ${path
              .slice(1)
              .map(({ x, y }) => "L" + x + " " + y)
              .join(" ")}`}
            stroke="black"
            fill="none"
          ></path>
        )}
      </svg>
    );
  }
}

export { EndlessThread };
