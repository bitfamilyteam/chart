// @flow

import R from 'ramda';
import React from 'react';
import type { Node } from 'react';
import { Defs, LinearGradient, Stop } from 'react-native-svg';

type GradientCoords = {
  x1: string,
  x2: string,
  y1: string,
  y2: string,
};

type GradientStop = {
  offset: string,
  color: string,
  opacity: number,
};

type GradientStops = Array<GradientStop>;

type GradientOptions = {
  coords: GradientCoords,
  stops: GradientStops,
};

type GradientProps = {
  options: GradientOptions,
  id: string,
};

function renderStops(stops: GradientStops): Array<Node> {
  return R.map(
    stop => <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />,
    stops,
  );
}

export default function Gradient(props: GradientProps) {
  const {
    options: { coords, stops },
    id,
  } = props;
  const {
    x1, x2, y1, y2,
  } = coords;
  return (
    <Defs>
      <LinearGradient id={id} x1={x1} x2={x2} y1={y1} y2={y2}>
        {renderStops(stops)}
      </LinearGradient>
    </Defs>
  );
}

export type { GradientOptions };
