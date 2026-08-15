import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

const metropolisBase =
  'Metropolis, "Metropolis Variable", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const metropolisHeading =
  'Metropolis, "Metropolis Variable", "SF Pro Display", "New York", "SF Pro Text", "SF Compact", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const metropolisMono =
  'SF Mono, "SF Pro Text", "SF Compact", "New York", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export default (server, darkMode, direction) =>
  useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: metropolisBase,
          fontWeightRegular: 400,
          fontWeightMedium: 600,
          fontWeightBold: 700,
          h1: {
            fontFamily: metropolisHeading,
            fontWeight: 700,
          },
          h2: {
            fontFamily: metropolisHeading,
            fontWeight: 700,
          },
          h3: {
            fontFamily: metropolisHeading,
            fontWeight: 700,
          },
          h4: {
            fontFamily: metropolisHeading,
            fontWeight: 700,
          },
          h5: {
            fontFamily: metropolisHeading,
            fontWeight: 600,
          },
          h6: {
            fontFamily: metropolisHeading,
            fontWeight: 600,
          },
          subtitle1: {
            fontFamily: metropolisHeading,
            fontWeight: 600,
          },
          subtitle2: {
            fontFamily: metropolisHeading,
            fontWeight: 600,
          },
          body1: {
            fontFamily: metropolisBase,
            fontWeight: 400,
          },
          body2: {
            fontFamily: metropolisBase,
            fontWeight: 400,
          },
          button: {
            fontFamily: metropolisHeading,
            textTransform: 'none',
            fontWeight: 600,
          },
          caption: {
            fontFamily: metropolisBase,
            fontWeight: 400,
          },
          overline: {
            fontFamily: metropolisBase,
            fontWeight: 400,
          },
          code: {
            fontFamily: metropolisMono,
          },
        },
        palette: palette(server, darkMode),
        direction,
        dimensions,
        components,
      }),
    [server, darkMode, direction],
  );
