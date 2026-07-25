import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, G, Path, Line, Rect } from 'react-native-svg';

export function CatLoginMascot({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  // Scale down the cat if the screen is too small
  const maxScale = Math.min(1, width / 840);
  
  return (
    <View style={[styles.container, { transform: [{ translateX: -417 }, { scale: maxScale }] }]}>
      <View style={styles.scaler}>
        {/* SVG BODY */}
        <Svg viewBox="0 0 834.19 711.34" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
      <Defs>
        
        <LinearGradient id="linear-gradient" x1="40.83" y1="27.94" x2="184.94" y2="172.05"
          gradientTransform="translate(-4.99 8.17) rotate(-3.61)" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#fffffe" />
          <Stop offset="0.32" stopColor="#fcfefe" />
          <Stop offset="0.58" stopColor="#f2fafd" />
          <Stop offset="0.82" stopColor="#e1f4fb" />
          <Stop offset="1" stopColor="#cfeef9" />
        </LinearGradient>
        <LinearGradient id="linear-gradient-2" x1="86.56" y1="75.57" x2="177.19" y2="166.21"
          gradientTransform="translate(-4.99 8.17) rotate(-3.61)" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7a424" />
          <Stop offset="0" stopColor="#f7a223" />
          <Stop offset="0.38" stopColor="#f69b1d" />
          <Stop offset="0.61" stopColor="#f59014" />
          <Stop offset="0.81" stopColor="#f48108" />
          <Stop offset="0.98" stopColor="#e6530e" />
          <Stop offset="1" stopColor="#e5500e" />
        </LinearGradient>
        <LinearGradient id="linear-gradient-3" x1="792.41" y1="27.78" x2="648.3" y2="171.89"
          gradientTransform="translate(7.49 -49.07) rotate(3.99)" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7a424" />
          <Stop offset="0.48" stopColor="#f69518" />
          <Stop offset="1" stopColor="#f48108" />
        </LinearGradient>
        <LinearGradient id="linear-gradient-4" x1="746.68" y1="75.41" x2="656.05" y2="166.04"
          gradientTransform="translate(7.49 -49.07) rotate(3.99)" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7a424" />
          <Stop offset="0" stopColor="#f7a223" />
          <Stop offset="0.36" stopColor="#f69b1d" />
          <Stop offset="0.6" stopColor="#f59014" />
          <Stop offset="0.81" stopColor="#f48108" />
          <Stop offset="1" stopColor="#e5500e" />
        </LinearGradient>
        <LinearGradient id="linear-gradient-5" x1="417.09" y1="27.39" x2="417.09" y2="711.34"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#fffffe" />
          <Stop offset="0.47" stopColor="#fffffe" />
          <Stop offset="0.55" stopColor="#fffffe" />
          <Stop offset="0.78" stopColor="#fdfefe" />
          <Stop offset="0.87" stopColor="#f6fcfd" />
          <Stop offset="0.93" stopColor="#eaf8fc" />
          <Stop offset="0.98" stopColor="#d9f2fa" />
          <Stop offset="1" stopColor="#cfeef9" />
        </LinearGradient>
        <LinearGradient id="linear-gradient-6" x1="417.09" y1="198.87" x2="417.09" y2="489.62"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#e5500e" />
          <Stop offset="0.37" stopColor="#e14e0e" />
          <Stop offset="0.77" stopColor="#d4470c" />
          <Stop offset="1" stopColor="#c9420b" />
        </LinearGradient>
        <LinearGradient id="linear-gradient-7" x1="250.85" y1="590.45" x2="0" y2="590.45"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7a424" />
          <Stop offset="0.56" stopColor="#f7a223" />
          <Stop offset="0.76" stopColor="#f69b1d" />
          <Stop offset="0.9" stopColor="#f59014" />
          <Stop offset="1" stopColor="#f48108" />
        </LinearGradient>
        <LinearGradient id="linear-gradient-8" x1="583.34" y1="590.45" x2="834.19" y2="590.45"
          >
          <Stop offset="0" stopColor="#f7a424" />
          <Stop offset="0.56" stopColor="#f7a223" />
          <Stop offset="0.76" stopColor="#f69b1d" />
          <Stop offset="0.9" stopColor="#f59014" />
          <Stop offset="1" stopColor="#f48108" />
        </LinearGradient>
      </Defs>
      <G id="Layer_2" data-name="Layer 2">
        <G id="Layer_1-2" data-name="Layer 1">
          <Path fill="url(#linear-gradient)"
            d="M266.52,81.88,172,152l-94.54,70.1L61.9,102.33,52.6,30.71a26.86,26.86,0,0,1,38-28.18l65.84,29.7Z" />
          <Path fill="url(#linear-gradient-2)"
            d="M230.18,108.57l-59.46,44.1-59.45,44.09-9.78-75.32-5.85-45a16.89,16.89,0,0,1,23.89-17.72l41.41,18.68Z" />
          <Path fill="url(#linear-gradient-3)"
            d="M566.73,80.64l94.07,70.73,94.07,70.73,16.34-119.65L781,30.88A26.86,26.86,0,0,0,743.18,2.46l-66,29.26Z" />
          <Path fill="url(#linear-gradient-4)"
            d="M602.9,107.58l59.16,44.48,59.16,44.49,10.28-75.26,6.15-45A16.9,16.9,0,0,0,713.87,58.4L672.34,76.81Z" />
          <Path fill="url(#linear-gradient-5)"
            d="M417.09,27.39h0A409.06,409.06,0,0,1,826.16,436.45V711.34a0,0,0,0,1,0,0H8a0,0,0,0,1,0,0V436.45A409.06,409.06,0,0,1,417.09,27.39Z" />
          <Path fill="#f7a424"
            d="M738.05,182.82a196,196,0,0,1-129,48.15c-108.65,0-196.74-88.08-196.74-196.73q0-3.42.12-6.82,2.31,0,4.62,0a409.19,409.19,0,0,1,321,155.43Z" />
          <Path fill="#f48108"
            d="M321.56,138.54h0a5.18,5.18,0,0,1-5.11-4.29,24.77,24.77,0,0,0-48.79,0,5.2,5.2,0,0,1-5.11,4.29h0a5.18,5.18,0,0,1-5.14-6,35.16,35.16,0,0,1,69.28,0A5.17,5.17,0,0,1,321.56,138.54Z" />
          <Path fill="#f48108"
            d="M571,138.54h0a5.19,5.19,0,0,1-5.11-4.29,24.77,24.77,0,0,0-48.79,0,5.18,5.18,0,0,1-5.11,4.29h0a5.17,5.17,0,0,1-5.13-6,35.16,35.16,0,0,1,69.28,0A5.18,5.18,0,0,1,571,138.54Z" />
          <Line fill="none" x1="327.21" y1="138.54" x2="316.82" y2="138.54" />
          <Line fill="none" x1="267.29" y1="138.54" x2="256.9" y2="138.54" />
          <Path id="svg-nose" fill="#f48108"
            d="M434.47,150.91H399.72A7.47,7.47,0,0,0,394,163.17l6.45,7.75L411.35,184a7.58,7.58,0,0,0,.85.85v24.69h9.48V185.14a8.06,8.06,0,0,0,1.16-1.11l10.92-13.11,6.45-7.75A7.47,7.47,0,0,0,434.47,150.91Z" />
          <Path id="svg-mouth" fill="url(#linear-gradient-6)" transform="translate(0, 198.87) scale(1, 0.91) translate(0, -198.87)"
            d="M650.06,318.11a171.7,171.7,0,0,1-103.7,157.58q-6.83,2.94-14,5.3c-1,.33-2,.65-3,1s-2.06.63-3.1.93h0c-1,.3-2.07.58-3.1.86s-2.1.56-3.15.82c-1.6.4-3.2.77-4.82,1.12l-2.62.55-.58.12c-.93.18-1.86.36-2.79.52s-2,.36-3,.52c-.5.09-1,.17-1.52.24l-3,.44-1.27.16c-1.87.24-3.74.44-5.62.62l-1.6.14-1.21.1-2.41.17-2.73.15c-.84,0-1.68.08-2.52.1-1,0-2.05.06-3.08.08l-2.68,0H355.63q-1.49,0-3,0l-1.53,0q-5.47-.13-10.86-.62l-2.17-.21c-1.44-.14-2.87-.31-4.3-.49l-1.67-.22c-.87-.12-1.74-.24-2.61-.38l-1.77-.28c-.82-.13-1.65-.27-2.47-.42s-1.41-.25-2.11-.39l-1.93-.38-2.25-.48-1.74-.39-1.91-.44-2.56-.64-2-.54q-4.08-1.11-8.1-2.41l-1.48-.49c-1-.35-2.1-.71-3.14-1.09s-1.81-.65-2.7-1l-1.5-.57q-2.73-1-5.41-2.2l-.58-.25A171.54,171.54,0,0,1,184.13,318.11,119.17,119.17,0,0,1,303.36,198.87H530.83A119.2,119.2,0,0,1,650.06,318.11Z" />
          {/* Orange Tongue/Throat at the bottom of the mouth */}
          <Path id="svg-tongue" fill="#f48108"
            d="M546.36,475.69a171,171,0,0,1-67.82,13.93H355.63a171,171,0,0,1-67.81-13.93,82.91,82.91,0,0,1,129.27-37.12,82.91,82.91,0,0,1,129.27,37.12Z" />
          <Path id="svg-tooth-left" fill="#fffffe" transform="translate(0, 198.87) scale(1, 0.93) translate(0, -198.87)"
            d="M308.73,197l-9.06,23.14-7.82,20a8.62,8.62,0,0,1-14.47,2.54l-13.7-16.21-13.79-16.33A115.07,115.07,0,0,1,303.36,197Z" />
          <Path id="svg-tooth-right" fill="#fffffe"
            transform="translate(0, 198.87) scale(1, 0.93) translate(0, -198.87)"
            d="M584.52,211.63l-14,16-13.7,15.6a8.78,8.78,0,0,1-14.47-2.44l-7.82-19.23-9.21-22.64h5.52A118.53,118.53,0,0,1,584.52,211.63Z" />

          {/* Chewing closed mouth group */}
          <G id="svg-chewing-group" >
            <Path fill="#f48108"
              d="M434.47,150.91H399.72A7.47,7.47,0,0,0,394,163.17l6.45,7.75L411.35,184a7.58,7.58,0,0,0,.85.85v20.39a4.3,4.3,0,0,0,4.3,4.3h.88a4.29,4.29,0,0,0,4.3-4.3V185.14a8.06,8.06,0,0,0,1.16-1.11l10.92-13.11,6.45-7.75A7.47,7.47,0,0,0,434.47,150.91Z" />
            <Path fill="#e5500e"
              d="M327.47,228.66a5,5,0,0,1-.86-10L506.84,187a5,5,0,1,1,1.73,9.9L328.34,228.59A5.1,5.1,0,0,1,327.47,228.66Z" />
          </G>

          {/* Wrapped hands in group to shift them up by 52px */}
          <G transform="translate(0, -52)">
            <Path fill="#f7a424" d="M227,636.82a41.76,41.76,0,0,1-4.94,2C223.73,638.16,225.37,637.5,227,636.82Z" />
            <Path fill="url(#linear-gradient-7)"
              d="M250.85,598.31a43.28,43.28,0,0,1-.29,5,41,41,0,0,1-.89,5,42.7,42.7,0,0,1-22.9,28.43l-.22.1c-1.64.68-3.28,1.34-4.94,2l-.06,0A269.07,269.07,0,0,1,8.93,631,15.63,15.63,0,0,1,0,616.92V528.64A4.71,4.71,0,0,1,7.76,525a179.54,179.54,0,0,0,177.05,32.54v-.07a17.76,17.76,0,0,1,12.81-17.19,17.92,17.92,0,0,1,23,17.18,42.61,42.61,0,0,1,21.14,14.45,42.55,42.55,0,0,1,9.13,26.37Z" />
            <Path fill="#f48108"
              d="M245.32,577.3c-6.4-.95-17.82-1-27.36,8.15a2.5,2.5,0,1,1-3.46-3.62,36.17,36.17,0,0,1,27.22-9.89A42.16,42.16,0,0,1,245.32,577.3Z" />
            <Path fill="#f48108"
              d="M250.56,603.3a41,41,0,0,1-.89,5,30.74,30.74,0,0,0-22.2-.08,2.49,2.49,0,0,1-1.86,0,2.51,2.51,0,0,1,.08-4.65A35.47,35.47,0,0,1,250.56,603.3Z" />
            <Path fill="#f7a424" d="M607.18,636.82a41.76,41.76,0,0,0,4.94,2C610.46,638.16,608.82,637.5,607.18,636.82Z" />
            <Path fill="url(#linear-gradient-8)"
              d="M583.34,598.31a43.28,43.28,0,0,0,.29,5,41,41,0,0,0,.89,5,42.7,42.7,0,0,0,22.9,28.43l.22.1c1.64.68,3.28,1.34,4.94,2l.06,0A269.07,269.07,0,0,0,825.26,631a15.63,15.63,0,0,0,8.93-14.09V528.64a4.71,4.71,0,0,0-7.76-3.61,179.54,179.54,0,0,1-177,32.54v-.07a17.76,17.76,0,0,0-12.81-17.19,17.92,17.92,0,0,0-23,17.18,42.61,42.61,0,0,0-21.14,14.45,42.55,42.55,0,0,0-9.13,26.37Z" />
            <Path fill="#f48108"
              d="M588.87,577.3c6.4-.95,17.82-1,27.36,8.15a2.5,2.5,0,0,0,3.46-3.62,36.17,36.17,0,0,0-27.22-9.89A42.16,42.16,0,0,0,588.87,577.3Z" />
            <Path fill="#f48108"
              d="M583.63,603.3a41,41,0,0,0,.89,5,30.74,30.74,0,0,1,22.2-.08,2.49,2.49,0,0,0,1.86,0,2.51,2.51,0,0,0-.08-4.65A35.47,35.47,0,0,0,583.63,603.3Z" />
          </G>

          <Rect id="svg-input-bg-card" fill="#fffffe" x="254.59" y="268.37" width="325" height="111.9" rx="11.62" />
          <Rect id="svg-input-bg-line" fill="#E5D9CE" x="254.59" y="320.48" width="325" height="6" />
        </G>
      </G>
    </Svg>

        {/* FORM CONTAINER */}
        <View style={styles.formContainer}>
          {children}
        </View>

        {/* SVG HANDS */}
        <Svg viewBox="0 0 834.19 711.34" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
      <Defs>
        
        <LinearGradient id="overlay-linear-gradient-7" x1="250.85" y1="590.45" x2="0" y2="590.45"
          gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#f7a424" />
          <Stop offset="0.56" stopColor="#f7a223" />
          <Stop offset="0.76" stopColor="#f69b1d" />
          <Stop offset="0.9" stopColor="#f59014" />
          <Stop offset="1" stopColor="#f48108" />
        </LinearGradient>
        <LinearGradient id="overlay-linear-gradient-8" x1="583.34" y1="590.45" x2="834.19" y2="590.45"
          >
          <Stop offset="0" stopColor="#f7a424" />
          <Stop offset="0.56" stopColor="#f7a223" />
          <Stop offset="0.76" stopColor="#f69b1d" />
          <Stop offset="0.9" stopColor="#f59014" />
          <Stop offset="1" stopColor="#f48108" />
        </LinearGradient>
      </Defs>
      {/* Wrapped overlay hands in group to shift them up by 52px */}
      <G transform="translate(0, -52)">
        {/* Left hand */}
        <Path fill="url(#overlay-linear-gradient-7)"
          d="M250.85,598.31a43.28,43.28,0,0,1-.29,5,41,41,0,0,1-.89,5,42.7,42.7,0,0,1-22.9,28.43l-.22.1c-1.64.68-3.28,1.34-4.94,2l-.06,0A269.07,269.07,0,0,1,8.93,631,15.63,15.63,0,0,1,0,616.92V528.64A4.71,4.71,0,0,1,7.76,525a179.54,179.54,0,0,0,177.05,32.54v-.07a17.76,17.76,0,0,1,12.81-17.19,17.92,17.92,0,0,1,23,17.18,42.61,42.61,0,0,1,21.14,14.45,42.55,42.55,0,0,1,9.13,26.37Z" />
        <Path fill="#f48108"
          d="M245.32,577.3c-6.4-.95-17.82-1-27.36,8.15a2.5,2.5,0,1,1-3.46-3.62,36.17,36.17,0,0,1,27.22-9.89A42.16,42.16,0,0,1,245.32,577.3Z" />
        <Path fill="#f48108"
          d="M250.56,603.3a41,41,0,0,1-.89,5,30.74,30.74,0,0,0-22.2-.08,2.49,2.49,0,0,1-1.86,0,2.51,2.51,0,0,1,.08-4.65A35.47,35.47,0,0,1,250.56,603.3Z" />
        {/* Right hand */}
        <Path fill="url(#overlay-linear-gradient-8)"
          d="M583.34,598.31a43.28,43.28,0,0,0,.29,5,41,41,0,0,0,.89,5,42.7,42.7,0,0,0,22.9,28.43l.22.1c1.64.68,3.28,1.34,4.94,2l.06,0A269.07,269.07,0,0,0,825.26,631a15.63,15.63,0,0,0,8.93-14.09V528.64a4.71,4.71,0,0,0-7.76-3.61,179.54,179.54,0,0,1-177,32.54v-.07a17.76,17.76,0,0,0-12.81-17.19,17.92,17.92,0,0,0-23,17.18,42.61,42.61,0,0,0-21.14,14.45,42.55,42.55,0,0,0-9.13,26.37Z" />
        <Path fill="#f48108"
          d="M588.87,577.3c6.4-.95,17.82-1,27.36,8.15a2.5,2.5,0,0,0,3.46-3.62,36.17,36.17,0,0,0-27.22-9.89A42.16,42.16,0,0,0,588.87,577.3Z" />
        <Path fill="#f48108"
          d="M583.63,603.3a41,41,0,0,0,.89,5,30.74,30.74,0,0,1,22.2-.08,2.49,2.49,0,0,0,1.86,0,2.51,2.51,0,0,0-.08-4.65A35.47,35.47,0,0,0,583.63,603.3Z" />
      </G>
    </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 834.19,
    height: 711.34,
    zIndex: 100,
    transformOrigin: 'bottom center', // Note: transformOrigin needs RN 0.73+
  },
  scaler: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  formContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
  }
});
