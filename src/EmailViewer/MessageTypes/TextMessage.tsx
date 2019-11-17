import * as React from "react";
import { Base64 } from "js-base64";

export const TextMessage = ({ data }: { data: string }) => (
  <div style={{ whiteSpace: "pre-line" }}>{Base64.atob(data)}</div>
);
