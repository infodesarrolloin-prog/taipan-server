import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MapView from '../map/core/MapView';
import MapSelectedDevice from '../map/main/MapSelectedDevice';
import MapAccuracy from '../map/main/MapAccuracy';
import MapGeofence from '../map/MapGeofence';
import MapCurrentLocation from '../map/MapCurrentLocation';
import PoiMap from '../map/main/PoiMap';
import MapPadding from '../map/MapPadding';
import { devicesActions, sessionActions } from '../store';
import MapDefaultCamera from '../map/main/MapDefaultCamera';
import MapLiveRoutes from '../map/main/MapLiveRoutes';
import MapPositions from '../map/MapPositions';
import MapOverlay from '../map/overlay/MapOverlay';
import MapGeocoder from '../map/control/MapGeocoder';
import MapScale from '../map/MapScale';
import MapRuler from '../map/control/MapRuler';
import MapNotification from '../map/control/MapNotification';
import useFeatures from '../common/util/useFeatures';
import { useAttributePreference } from '../common/util/preferences';
import { useCatch } from '../reactHelper';
import fetchOrThrow from '../common/util/fetchOrThrow';

// Push maplibre controls below the floating header on mobile
const MAP_CTRL_TOP_MOBILE = '80px';
const MAP_CTRL_TOP_DESKTOP = '8px';

const useMapControlStyle = (desktop) => {
  useEffect(() => {
    const styleId = 'maplibre-ctrl-position-fix';
    let el = document.getElementById(styleId);
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      document.head.appendChild(el);
    }
    el.textContent = desktop
      ? `.maplibregl-ctrl-top-right,.maplibregl-ctrl-top-left{top:${MAP_CTRL_TOP_DESKTOP}!important}`
      : `.maplibregl-ctrl-top-right,.maplibregl-ctrl-top-left{top:${MAP_CTRL_TOP_MOBILE}!important}`;
    return () => {};
  }, [desktop]);
};

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const eventsAvailable = useSelector((state) => !!state.events.items.length);
  const user = useSelector((state) => state.session.user);

  const features = useFeatures();

  const [rulerActive, setRulerActive] = useState(false);

  const darkMode = useAttributePreference('darkMode', true);

  // Push map nav controls below the floating search bar
  useMapControlStyle(desktop);

  const toggleTheme = useCatch(async () => {
    const newDarkMode = !darkMode;
    const updatedAttributes = { ...user.attributes, darkMode: newDarkMode };
    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes: updatedAttributes }),
    });
    dispatch(sessionActions.updateUser(await response.json()));
  });

  const onMarkerClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.selectId(deviceId));
    },
    [dispatch],
  );

  // Unified handler that works for both mouse-click and touch on Android
  const handleThemeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  const fabBg = theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.80)' : 'rgba(230,238,255,0.88)';
  const fabColor = darkMode ? '#FFD166' : theme.palette.primary.main;
  const fabBorder =
    theme.palette.mode === 'dark'
      ? '1px solid rgba(255,255,255,0.15)'
      : '1px solid rgba(44,111,224,0.25)';

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes deviceIds={filteredPositions.map((p) => p.deviceId)} />
        <MapPositions
          positions={filteredPositions}
          onMarkerClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus
          disabled={rulerActive}
        />
        <MapDefaultCamera filteredPositions={filteredPositions} />
        <MapSelectedDevice />
        <PoiMap />
        <MapRuler positions={filteredPositions} onActiveChange={setRulerActive} />
        {!features.disableEvents && (
          <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
        )}
      </MapView>
      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      {desktop && (
        <MapPadding
          start={
            parseInt(theme.dimensions.drawerWidthDesktop, 10) + parseInt(theme.spacing(1.5), 10)
          }
        />
      )}
      {/* Theme toggle FAB — works on both mouse and Android touch */}
      <IconButton
        id="theme-toggle-fab"
        aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        onClick={handleThemeToggle}
        onTouchEnd={handleThemeToggle}
        sx={{
          position: 'fixed',
          bottom: desktop ? 88 : 104,
          right: 16,
          zIndex: 10,
          width: 46,
          height: 46,
          borderRadius: '13px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          backgroundColor: fabBg,
          border: fabBorder,
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          color: fabColor,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          transition: theme.transitions.create(
            ['background-color', 'box-shadow', 'transform', 'color'],
            { duration: theme.transitions.duration.shorter },
          ),
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(20,32,64,0.92)' : 'rgba(210,225,255,0.96)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {darkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </>
  );
};

export default MainMap;
