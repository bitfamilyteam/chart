// @flow

import React from 'react';
import { View, Platform } from 'react-native';
import { Rect, Svg, Image } from 'react-native-svg';
import Gradient from './Gradient';
import type { GradientOptions } from './Gradient';
import backgroundImage from '../../resources/background.jpg';

type BackgroundProps = {
  width?: number | string,
  height?: number | string,
  gradientOptions: GradientOptions,
  id: string
};

// cSpell:disable xMidyMid

function Background(props: BackgroundProps) {
  const width = props.width || '100%';
  const height = props.height || '100%';
  const { gradientOptions, id } = props;

  return (
    <View style={{
      width,
      height,
      flex: 1,
      position: 'absolute',
      top: 0,
    }}
    >
      <Svg
        width={width}
        height={height}
      >
        {
          Platform.OS !== 'ios' && (
            <Image
              href={backgroundImage}
              x="0%"
              y="0%"
              preserveAspectRatio="xMidyMid slice"
              width={width}
              height={height}
            />
          )
        }
        <Rect
          x="0%"
          y="0%"
          opacity={0.6}
          width={width}
          height={height}
          fill={`url(#${id})`}
        />
        <Gradient
          options={gradientOptions}
          id={id}
        />
      </Svg>
    </View>
  );
}

export default Background;
