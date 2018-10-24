// @flow

type Point = {
  x: number,
  y: number
};

type Opacity = string | number;

type PressEvent = {
  nativeEvent: {
    locationX: number,
    locationY: number
  }
};

type LayoutEvent = {
  nativeEvent: {
    layout: {
      x: number,
      y: number,
      width: number,
      height: number
    }
  }
};

type WH = {
  width: number | string,
  height: number | string
};

type Range = {
  min: number,
  max: number
}

export type {
  Point,
  Opacity,
  PressEvent,
  LayoutEvent,
  WH,
  Range,
};
