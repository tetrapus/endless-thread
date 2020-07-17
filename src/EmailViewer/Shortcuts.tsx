import React from "react";
import "./Shortcuts.scss";

interface Props {}
interface State {
  overlay: boolean;
}

export class Shortcuts extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { overlay: false };
  }

  componentDidMount() {
    document.addEventListener("keypress", (event) =>
      this.onGlobalKeypress(event)
    );
    document.addEventListener("keydown", (event) => this.onKeyDown(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
  }

  onGlobalKeypress(event: KeyboardEvent): void {
    if (event.target == document.body) {
      const targets = Array.from(
        document.querySelectorAll(
          `[data-shortcut="${event.key}"][data-trigger]`
        )
      ).filter((elem) => this.inViewport(elem));
      if (targets.length) {
        const target = targets[0];
        setTimeout(() => target[target.getAttribute("data-trigger")](), 10);
      }
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.target == document.body) {
      if (event.key == "?") {
        this.setState({ overlay: true });
      }
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.target == document.body) {
      if (event.key == "?") {
        this.setState({ overlay: false });
      }
    }
  }

  inViewport(elem: Element): boolean {
    const bounding = elem.getBoundingClientRect();
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  offset(elem: Element) {
    const rect = elem.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  }

  render() {
    if (!this.state.overlay) {
      return null;
    }

    const targets = Array.from(
      document.querySelectorAll("[data-shortcut]")
    ).filter((elem) => this.inViewport(elem));
    const firstTargets = targets.filter(
      (target) =>
        target ===
        targets.find(
          (t) =>
            t.getAttribute("data-shortcut") ==
            target.getAttribute("data-shortcut")
        )
    );

    return (
      <div>
        <div className="ShortcutOverlay"></div>
        {firstTargets.map((target) => {
          const position = this.offset(target);
          return (
            <div>
              <div
                className="ShortcutHint"
                style={{
                  top: position.top - 30,
                  left: position.left - 30,
                }}
              >
                {target.getAttribute("data-shortcut")}
              </div>
              <div
                className="ShortcutOverlay"
                style={{
                  top: position.top,
                  left: position.left,
                  width: target.clientWidth,
                  height: target.clientHeight,
                }}
              ></div>
            </div>
          );
        })}
      </div>
    );
  }
}
