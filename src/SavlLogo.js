// @flow

import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

function SavlLogo() {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
      }}
    >
      <Svg style={{ width: 86, height: 40 }}>
        <G x={-600} y={28 - 70}>
          <Path
            fill="white"
            stroke="none"
            d="M614.16,77.14c3.33,-0.87 5.3,-3.05 5.69,-6.25c0.33,-2.95 -1.87,-5.3 -7.1,-7.58c-4.28,-1.87 -4.84,-2.33 -3.87,-3.33c0.46,-0.44 0.85,-0.54 2.28,-0.51c1.67,0 4.41,0.72 6.02,1.56c0.41,0.2 0.79,0.31 0.87,0.23c0.08,-0.05 0.15,-1.1 0.15,-2.31c0.05,-2.59 -0.31,-3.25 -2.28,-4.25c-1.13,-0.59 -1.56,-0.64 -4.33,-0.64c-3.92,0 -5.46,0.54 -7.56,2.66c-2.13,2.13 -2.56,4.15 -1.43,6.56c1,2.2 2.66,3.33 7.28,5.02c3.69,1.33 4.36,2.15 2.72,3.23c-0.51,0.33 -1.18,0.44 -2.51,0.44c-2.05,-0.03 -3.46,-0.36 -5.61,-1.31c-0.79,-0.36 -1.54,-0.59 -1.61,-0.51c-0.1,0.08 -0.18,1 -0.18,2.02c-0.05,3.02 1,4.58 3.41,5.05c1.82,0.36 6.64,0.31 8.07,-0.08z"
          />
          <Path
            fill="white"
            stroke="none"
            d="M630.01,77.13c-3.08,-0.97 -5.72,-3.97 -6.77,-7.71c-0.46,-1.64 -0.46,-5.51 0,-7.17c0.9,-3.28 3.08,-5.97 5.87,-7.25c1.21,-0.56 1.92,-0.69 4.08,-0.77c2.95,-0.13 3.95,0.2 5.93,1.87c0.92,0.79 1.05,0.85 1.18,0.44c0.26,-0.74 2,-1.56 3.72,-1.74l1.56,-0.18v22.36h-5.64v-2.56l-1.28,1c-2.44,1.92 -5.82,2.59 -8.64,1.72zM637.2,70.91c0.38,-0.2 1.18,-0.77 1.74,-1.28l1,-0.9v-5.74l-0.9,-0.92c-2.85,-2.92 -7.08,-2.56 -9.03,0.77c-0.62,1.02 -0.72,1.49 -0.69,3c0,1.13 0.15,2.07 0.41,2.59c0.59,1.08 2.33,2.61 3.21,2.82c0.41,0.08 0.85,0.18 0.97,0.23c0.46,0.18 2.54,-0.18 3.28,-0.56z"
          />
          <Path
            fill="white"
            stroke="none"
            d="M657.65,77.04h3.31h3.31l0.77,-1.98c0.44,-1.1 1.18,-3.1 1.67,-4.44c1.26,-3.39 3.62,-9.62 4.82,-12.75c0.54,-1.44 1,-2.74 1,-2.92c0,-0.23 -0.59,-0.26 -2.26,-0.18c-2.59,0.15 -4,0.74 -5.03,2.05c-0.51,0.69 -3.36,9.16 -3.92,11.7c-0.08,0.31 -0.23,0.56 -0.33,0.56c-0.08,0 -0.9,-2.39 -1.8,-5.31c-0.9,-2.95 -1.9,-5.82 -2.23,-6.41c-0.92,-1.69 -2.36,-2.39 -5.18,-2.57c-2.69,-0.18 -2.67,-0.18 -1.8,2.03c0.31,0.74 2.03,5.28 3.82,10.08c1.8,4.8 3.41,9.03 3.56,9.44z"
          />
          <Path
            fill="white"
            stroke="none"
            d="M676.1,77.04h2.95h2.95v-14.57v-14.57l-0.69,-0.67c-1.1,-1.03 -1.72,-1.23 -3.51,-1.23h-1.69v15.52z"
          />
        </G>
      </Svg>
    </View>
  );
}

export default SavlLogo;
