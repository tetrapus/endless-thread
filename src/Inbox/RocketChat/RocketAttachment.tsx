import * as React from "react";
import "./RocketAttachment.scss";
import { Markdown } from "../UI/Markdown";
import { useState } from "react";

export function RocketAttachment({ attachment, rocketchat }: any) {
  const color =
    { danger: "red", good: "green", warning: "#ffa32d" }[attachment.color] ||
    attachment.color;
  const [image, setImage] = useState<any>(undefined);
  if (image === undefined) {
    if (attachment.image_url) {
      if (attachment.image_url.startsWith("/")) {
        rocketchat
          .getAssetUrl(document.rocketchatServer + attachment.image_url)
          .then((url) => {
            setImage(url);
          });
      } else {
        rocketchat.getAssetUrl(attachment.image_url).then((url) => {
          setImage(url);
        });
      }
    } else {
      setImage(null);
    }
  }

  return (
    <div className="RocketAttachment" style={{ borderLeftColor: color }}>
      <div>
        <b>
          <a href={attachment.title_link} target="_blank">
            {attachment.title}
          </a>
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
      ) : null}
    </div>
  );
}
