import * as React from "react";
import { Spinner } from "../UI/Spinner";
import { Base64 } from "js-base64";
import gmail = gapi.client.gmail;
import { definitely } from "../../helpers";
import { decode } from "urlsafe-base64";
import "./HtmlMessage.scss";

declare const caja: {
  load: (arg0: Element, arg1: any, arg2: any) => void;
  policy: {
    net: {
      ALL: number;
    };
  };
};

interface Props {
  data: string;
  attachments: { [cid: string]: gmail.MessagePart };
}
interface State {
  loading: boolean;
}

class HtmlMessage extends React.Component<Props, State> {
  renderTarget: React.RefObject<HTMLDivElement>;
  constructor(props: Readonly<Props>) {
    super(props);
    this.renderTarget = React.createRef();
    this.state = { loading: true };
  }

  render() {
    return (
      <div>
        {this.state.loading && <Spinner></Spinner>}
        <div ref={this.renderTarget}></div>
      </div>
    );
  }

  componentDidMount(): void {
    if (!this.renderTarget.current) {
      console.log("Err: unmounted rendertarget");
      return;
    }
    const data = Base64.encode(
      this.props.data
        .replace(/<div><strong>REPOSITORY<.*/, "")
        .replace(/<div><strong>TASK DETAIL<.*/, "")
        .replace(/<div><strong>EMAIL PREFERENCES<.*/, "")
        .replace(/<div><strong>POST DETAIL<.*/, "")
    );

    const uriPolicy = {
      rewrite: (uri: { domain_?: string; scheme_?: string; path_: string }) => {
        if (uri.domain_ === "attachments" && uri.scheme_ == "https") {
          const part = this.props.attachments[uri.path_.slice(1)];
          if (!part) {
            console.log("Uh oh!", uri, this.props.attachments);
          }
          const data = Base64.btoa(
            decode(definitely(definitely(part.body).data)).toString("binary")
          );
          return `data:${part.mimeType};base64,${data}`;
        }
        return uri;
      }
    };

    caja.load(this.renderTarget.current, uriPolicy, (frame: any) => {
      frame
        .code(`data:text/html;base64,${data}`, "text/html")
        .run(() => this.setState({ loading: false }));
    });

    //this.renderTarget.current.innerHTML = Base64.decode(data);
    //this.setState({loading: false});
  }
}

export { HtmlMessage };
