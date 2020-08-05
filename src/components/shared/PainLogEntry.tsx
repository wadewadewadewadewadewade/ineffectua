/* eslint-disable import/no-commonjs */

import * as React from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  ScrollViewProps,
  Dimensions,
  Platform,
  ScaledSize,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';

const COVERS = [
  { uri: "//static.invertase.io/assets/firebase/analytics.svg" }
];

export default function PainLogEntry(props: Partial<ScrollViewProps>) {
  const [dimensions, setDimensions] = React.useState(Dimensions.get('window'));

  React.useEffect(() => {
    const onDimensionsChange = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    Dimensions.addEventListener('change', onDimensionsChange);

    return () => Dimensions.removeEventListener('change', onDimensionsChange);
  }, []);

  const ref = React.useRef<ScrollView>(null);

  useScrollToTop(ref);

  const itemSize = dimensions.width / Math.floor(dimensions.width / 150);

  return (
    <ScrollView ref={ref} contentContainerStyle={styles.content} {...props}>
      {COVERS.map((source, i) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={[
            styles.item,
            Platform.OS !== 'web' && {
              height: itemSize,
              width: itemSize,
            },
          ]}
        >
          <Image source={source} style={styles.photo} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ...Platform.select({
    web: {
      content: {
        display: 'grid' as 'none',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      },
      item: {
        width: '100%',
      },
    },
    default: {
      content: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
    },
  }),
  photo: {
    flex: 1,
    resizeMode: 'cover',
    paddingTop: '100%',
  },
});
