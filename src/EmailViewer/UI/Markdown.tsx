import ReactMarkdown from "react-markdown";
import * as React from "react";

export function Markdown({
  source,
  renderers = {},
}: {
  source: string;
  children?: any;
  renderers?: any;
}) {
  if (!source) {
    return null;
  }
  const linkRenderer = ({
    href,
    children,
  }: {
    href: string;
    children: any[];
  }) => {
    return <a href={href} target="_blank">{children}</a>;
  };

  return (
    <ReactMarkdown
      source={source
        .replace(/^ +/gm, "")
        .replace(/^/gm, "\n")
        .replace(/<(.+)\|(.+)>/gm, (a, b, c) => `[${c}](${b})`)}
      renderers={{ ...renderers, link: linkRenderer }}
    ></ReactMarkdown>
  );
}
