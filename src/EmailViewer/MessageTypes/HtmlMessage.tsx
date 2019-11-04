import * as React from "react";
import { Spinner } from "../UI/Spinner";
import { decode } from "../../base64util";

declare const caja: {
  load: (arg0: Element, arg1: any, arg2: any) => void;
  policy: {
    net: {
      ALL: number;
    };
  };
};

interface Props {
    data: string
}
interface State {
    loading: boolean
}

class HtmlMessage extends React.Component<Props, State> {
  renderTarget: React.RefObject<HTMLDivElement>;
  constructor(props: Readonly<Props>) {
    super(props);
    this.renderTarget = React.createRef();
    this.state = {loading: true};
  }

  render() {
    return <div>
        {this.state.loading && <Spinner></Spinner>}
        <div ref={this.renderTarget}></div>
    </div>;
  }

  componentDidMount(): void {
    if (!this.renderTarget.current) {
      console.log("Err: unmounted rendertarget");
      return;
    }

    caja.load(this.renderTarget.current, caja.policy.net.ALL, (frame: any) => {
      frame
        .code(
          `data:text/html;base64,${this.props.data}`,
          "text/html"
        )
        .run(() => this.setState({loading: false}));
    });
  }
}

export { HtmlMessage };
