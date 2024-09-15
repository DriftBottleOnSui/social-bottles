import React from "react";
import {
  Button as NextUIButton,
  ButtonProps as NextUIButtonProps,
} from "@nextui-org/react";

interface ButtonProps extends NextUIButtonProps {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return (
      <NextUIButton
        {...props}
        ref={ref}
        className={`h-16 w-full bg-transparent text-white bg-contain bg-no-repeat bg-center ${props.className || ""}`}
        style={{
          backgroundImage: `url(/images/button-bg.svg)`,
          ...props.style,
        }}
      >
        {props.children}
      </NextUIButton>
    );
  },
);

Button.displayName = "Button";

export default Button;
