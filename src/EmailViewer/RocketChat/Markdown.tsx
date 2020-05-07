import ReactMarkdown from "react-markdown";
import * as React from "react";

export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown
      source={source.replace(/^ +/gm, "").replace(/^/gm, "\n").replace(/<(.+)\|(.+)>/gm, (a, b) => `[${b}](${a})`}
    ></ReactMarkdown>
  );
}
