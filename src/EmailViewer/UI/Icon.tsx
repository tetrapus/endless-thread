import * as React from "react";

type Props = {
  type: "close" | "expand" | "collapse" | "done";
  size?: number;
  fill?: string;
};

export const Icon = ({ type, size = 32, fill = "#aaa", className }: Props) => {
  switch (type) {
    case "close":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z"
          ></path>
        </svg>
      );
    case "expand":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"
          ></path>
        </svg>
      );
    case "collapse":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M240.971 130.524l194.343 194.343c9.373 9.373 9.373 24.569 0 33.941l-22.667 22.667c-9.357 9.357-24.522 9.375-33.901.04L224 227.495 69.255 381.516c-9.379 9.335-24.544 9.317-33.901-.04l-22.667-22.667c-9.373-9.373-9.373-24.569 0-33.941L207.03 130.525c9.372-9.373 24.568-9.373 33.941-.001z"
          ></path>
        </svg>
      );
    case "done":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
          ></path>
        </svg>
      );
    case "reply":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="reply"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M8.309 189.836L184.313 37.851C199.719 24.546 224 35.347 224 56.015v80.053c160.629 1.839 288 34.032 288 186.258 0 61.441-39.581 122.309-83.333 154.132-13.653 9.931-33.111-2.533-28.077-18.631 45.344-145.012-21.507-183.51-176.59-185.742V360c0 20.7-24.3 31.453-39.687 18.164l-176.004-152c-11.071-9.562-11.086-26.753 0-36.328z"
          ></path>
        </svg>
      );

    case "top":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="chevron-double-up"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M241 34.5l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9l-22.7 22.7c-9.4 9.4-24.5 9.4-33.9 0L224 131.5l-154.7 154c-9.4 9.3-24.5 9.3-33.9 0l-22.7-22.7c-9.4-9.4-9.4-24.6 0-33.9L207 34.5c9.4-9.3 24.6-9.3 34 0zm-34 192L12.7 420.9c-9.4 9.4-9.4 24.6 0 33.9l22.7 22.7c9.4 9.4 24.5 9.4 33.9 0l154.7-154 154.7 154c9.4 9.3 24.5 9.3 33.9 0l22.7-22.7c9.4-9.4 9.4-24.6 0-33.9L241 226.5c-9.4-9.3-24.6-9.3-34 0z"
          ></path>
        </svg>
      );

    case "bottom":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="chevron-double-down"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M207 477.5L12.7 283.1c-9.4-9.4-9.4-24.6 0-33.9l22.7-22.7c9.4-9.4 24.5-9.4 33.9 0l154.7 154 154.7-154c9.4-9.3 24.5-9.3 33.9 0l22.7 22.7c9.4 9.4 9.4 24.6 0 33.9L241 477.5c-9.4 9.3-24.6 9.3-34 0zm34-192L435.3 91.1c9.4-9.4 9.4-24.6 0-33.9l-22.7-22.7c-9.4-9.4-24.5-9.4-33.9 0L224 188.5 69.3 34.5c-9.4-9.3-24.5-9.3-33.9 0L12.7 57.2c-9.4 9.4-9.4 24.6 0 33.9L207 285.5c9.4 9.3 24.6 9.3 34 0z"
          ></path>
        </svg>
      );
    case "check":
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="check"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width={size}
          height={size}
        >
          <path
            fill={fill}
            d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"
          ></path>
        </svg>
      );
  }
};
