import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type BottleIdObj = {
  id: {
    txDigest: string;
    eventSeq: string;
  };
  packageId: string;
  transactionModule: string;
  sender: string;
  type: string;
  parsedJson: {
    action_type: string;
    bottle_id: string;
    from: string;
    to: string;
  };
  bcs: string;
  timestampMs: string;
};

export type Bottle = {
  id: string;
  from: string;
  to?: string;
  displayMsg: string;
  createAt: string;
  msgs: {
    content: string;
    mediaType: string;
  }[];
};
