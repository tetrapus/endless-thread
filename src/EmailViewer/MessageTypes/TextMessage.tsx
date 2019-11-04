import * as React from "react";

export const TextMessage = ({ data }: { data: string }) => (
  <div style={{ whiteSpace: "pre-line" }}>{atob(data)}</div>
);
