import * as React from "react";
import "./RocketAttachment.scss";
import ReactMarkdown from "react-markdown";
import { Markdown } from "./Markdown";

export function RocketAttachment({ attachment }: any) {
  const color =
    { danger: "red", good: "green" }[attachment.color] || attachment.color;
  const image =
    attachment.image_url && attachment.image_url.startsWith("/")
      ? document.rocketchatServer + attachment.image_url
      : attachment.image_url;
  return (
    <div className="RocketAttachment" style={{ borderLeftColor: color }}>
      <div>
        <b>
          <a href={attachment.title_link}>{attachment.title}</a>
        </b>
      </div>
      {image ? <img src={image} height="200px"></img> : ""}
      <Markdown source={attachment.text || ""}></Markdown>
      {attachment.fields ? (
        <div className="FieldContainer">
          {attachment.fields.map((field, idx) => (
            <div className="Field" key={idx}>
              <b>{field.title}</b>
              <Markdown source={field.value}></Markdown>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
