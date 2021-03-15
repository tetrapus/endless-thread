import * as React from "react";
import { Spinner } from "../../UI/Spinner";
import { Base64 } from "js-base64";
import gmail from "gapi.client.gmail";
import { definitely } from "../../../helpers";
import { decode } from "urlsafe-base64";
import sanitizeHtml from "sanitize-html";
import {
  Builder,
  HtmlSanitizer,
} from "ts-closure-library/lib/html/sanitizer/htmlsanitizer";
import "./HtmlMessage.scss";
import { SafeUrl } from "ts-closure-library/lib/html/safeurl";

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
    this.state = { loading: false };
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
      return;
    }

    const data = this.props.data
      .replace(/<div><strong>REPOSITORY<.*/, "")
      .replace(/<div><strong>TASK DETAIL<.*/, "")
      .replace(/<div><strong>EMAIL PREFERENCES<.*/, "")
      .replace(/<div><strong>POST DETAIL<.*/, "");

    const sanitizerOptions = new Builder()
      .withCustomNetworkRequestUrlPolicy(SafeUrl.sanitize)
      .allowCssStyles();
    const sanitizer = new HtmlSanitizer(sanitizerOptions);
    this.renderTarget.current.appendChild(sanitizer.sanitizeToDomNode(data));

    Array.from(
      this.renderTarget.current.querySelectorAll(
        "[src^='https://attachments/']"
      )
    ).forEach((node) => {
      const src = node.getAttribute("src");
      if (!src) {
        return;
      }
      const part = this.props.attachments[src.slice(20)];
      const data = Base64.btoa(
        decode(definitely(definitely(part.body).data)).toString("binary")
      );
      node.setAttribute("src", `data:${part.mimeType};base64,${data}#${src}`);
    });
    Array.from(
      this.renderTarget.current.querySelectorAll("a")
    ).forEach((node) => node.setAttribute("target", "_blank"));
  }
}

export { HtmlMessage };
