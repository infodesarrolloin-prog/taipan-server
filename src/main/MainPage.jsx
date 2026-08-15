import { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { Paper } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import DeviceList from './DeviceList';
import BottomMenu from '../common/components/BottomMenu';
import StatusCard from '../common/components/StatusCard';
import { devicesActions } from '../store';
import usePersistedState from '../common/util/usePersistedState';
import EventsDrawer from './EventsDrawer';
import useFilter from './useFilter';
import MainToolbar from './MainToolbar';
import { useAttributePreference } from '../common/util/preferences';

const MainMap = lazy(() => import('./MainMap'));

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    position: 'relative',
    // Ensure the root container never shows through as black
    backgroundColor: theme.palette.background.default,
  },
  // DESKTOP: map fills .root via its own absolute/fixed sizing from MapView
  // MOBILE: we put map at fixed z=1, everything else is pointer-none overlay
  mobileMapFill: {
    // Full-viewport map on mobile — extends all the way to bottom so no black zone
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    // Map renders here, BottomMenu (z:4) floats on top
  },
  sidebar: {
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      position: 'fixed',
      left: 0,
      top: 0,
      height: `calc(100% - ${theme.spacing(3)})`,
      width: theme.dimensions.drawerWidthDesktop,
      margin: theme.spacing(1.5),
      zIndex: 3,
      gap: theme.spacing(1.5),
    },
    [theme.breakpoints.down('md')]: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      // Stop sidebar above BottomMenu so BottomMenu glass card sits correctly
      bottom: '84px',
      zIndex: 3,
      background: 'transparent',
      gap: theme.spacing(1),
    },
  },
  header: {
    pointerEvents: 'auto',
    zIndex: 6,
    flexShrink: 0,
    [theme.breakpoints.up('md')]: {
      borderRadius: '16px',
      overflow: 'hidden',
    },
    [theme.breakpoints.down('md')]: {
      borderRadius: '16px',
      overflow: 'hidden',
      margin: theme.spacing(1),
      marginBottom: 0,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.86)' : 'rgba(240,245,255,0.88)',
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    },
  },
  footer: {
    pointerEvents: 'auto',
    zIndex: 5,
  },
  middle: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    position: 'relative',
  },
  contentList: {
    // Always rendered — pointer events controlled by devicesOpen
    zIndex: 4,
    display: 'flex',
    minHeight: 0,
    flex: 1,
    [theme.breakpoints.up('md')]: {
      borderRadius: '16px',
      overflow: 'hidden',
      pointerEvents: 'auto',
    },
    [theme.breakpoints.down('md')]: {
      borderRadius: '16px',
      overflow: 'hidden',
      margin: theme.spacing(1),
      marginTop: theme.spacing(0.75),
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.86)' : 'rgba(240,245,255,0.88)',
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    },
  },
}));

const MainPage = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const mapOnSelect = useAttributePreference('mapOnSelect', true);

  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const selectionSource = useSelector((state) => state.devices.selectionSource);
  const positions = useSelector((state) => state.session.positions);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const selectedPosition = filteredPositions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  const [filteredDevices, setFilteredDevices] = useState([]);

  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = usePersistedState('filter', {
    statuses: [],
    groups: [],
    geofences: [],
  });
  const [filterSort, setFilterSort] = usePersistedState('filterSort', '');
  const [filterMap, setFilterMap] = usePersistedState('filterMap', false);

  const devicesOpenState = useSelector((state) => state.devices.devicesOpen);
  const devicesOpen = devicesOpenState !== null ? devicesOpenState : desktop;
  const setDevicesOpen = useCallback(
    (val) => dispatch(devicesActions.setDevicesOpen(val)),
    [dispatch],
  );

  const [eventsOpen, setEventsOpen] = useState(false);

  const onEventsClick = useCallback(() => setEventsOpen(true), [setEventsOpen]);

  useEffect(() => {
    if (!desktop && mapOnSelect && selectedDeviceId && selectionSource !== 'avatar') {
      setDevicesOpen(false);
    }
  }, [desktop, mapOnSelect, selectedDeviceId, selectionSource, setDevicesOpen]);

  useFilter(
    keyword,
    filter,
    filterSort,
    filterMap,
    positions,
    setFilteredDevices,
    setFilteredPositions,
  );

  return (
    <div className={classes.root}>
      {/* ─── Desktop: map rendered inline, fills space next to sidebar ─── */}
      {desktop && (
        <Suspense fallback={null}>
          <MainMap
            filteredPositions={filteredPositions}
            selectedPosition={selectedPosition}
            onEventsClick={onEventsClick}
          />
        </Suspense>
      )}

      {/* ─── Mobile: map fixed at z:1, fills full viewport top-to-bottom ─── */}
      {!desktop && (
        <div className={classes.mobileMapFill}>
          <Suspense fallback={null}>
            <MainMap
              filteredPositions={filteredPositions}
              selectedPosition={selectedPosition}
              onEventsClick={onEventsClick}
            />
          </Suspense>
        </div>
      )}

      {/* ─── Sidebar overlay: pointer-events:none so touches pass through to map ─── */}
      <div className={classes.sidebar}>
        {/* Floating search/filter bar */}
        <Paper
          square={false}
          elevation={desktop ? 3 : 0}
          className={classes.header}
          sx={desktop ? {} : { backgroundColor: 'transparent' }}
        >
          <MainToolbar
            filteredDevices={filteredDevices}
            devicesOpen={devicesOpen}
            setDevicesOpen={setDevicesOpen}
            keyword={keyword}
            setKeyword={setKeyword}
            filter={filter}
            setFilter={setFilter}
            filterSort={filterSort}
            setFilterSort={setFilterSort}
            filterMap={filterMap}
            setFilterMap={setFilterMap}
          />
        </Paper>

        {/* Device list — pointer-events:none when hidden so touches reach the map */}
        <div className={classes.middle}>
          <Paper
            square={false}
            className={classes.contentList}
            sx={desktop ? {} : { backgroundColor: 'transparent' }}
            style={
              devicesOpen
                ? { pointerEvents: 'auto', visibility: 'visible' }
                : { pointerEvents: 'none', visibility: 'hidden' }
            }
          >
            <DeviceList devices={filteredDevices} />
          </Paper>
        </div>

        {desktop && (
          <div className={classes.footer}>
            <BottomMenu />
          </div>
        )}
      </div>

      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
          desktopPadding={theme.dimensions.drawerWidthDesktop}
        />
      )}
    </div>
  );
};

export default MainPage;
