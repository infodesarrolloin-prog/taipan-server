import { useEffect, useReducer, useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import { List } from 'react-window';
import { Typography, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { devicesActions } from '../store';
import { useAsyncTask, useCatchCallback } from '../reactHelper';
import DeviceRow from './DeviceRow';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { getDeviceStatusInfo } from '../map/core/preloadImages';
import { getAlarmResultState } from '../common/util/powerCutUtils';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  headerBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 1.25),
    margin: theme.spacing(0.5, 1, 0, 1),
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(44, 111, 224, 0.04)',
    border: `1px solid ${theme.palette.divider}`,
  },
  listContainer: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    width: '100%',
  },
  list: {
    height: '100%',
    direction: theme.direction,
    padding: theme.spacing(0.5, 1),
    boxSizing: 'border-box',
  },
}));

const DeviceList = ({ devices }) => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 400 });

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [updated, setUpdated] = useState(false);

  const runRefresh = useCatchCallback(async () => {
    if (window.clearAddressCache) {
      window.clearAddressCache();
    }
    const response = await fetchOrThrow('/api/devices');
    dispatch(devicesActions.refresh(await response.json()));
    setUpdated(true);
    window.setTimeout(() => setUpdated(false), 1200);
  }, [dispatch]);

  useAsyncTask(
    async ({ signal }) => {
      const response = await fetchOrThrow('/api/devices', { signal });
      dispatch(devicesActions.refresh(await response.json()));
    },
    [dispatch],
  );

  const positions = useSelector((state) => state.session.positions);

  const statusCounts = useMemo(() => {
    const counts = { moving: 0, stationary: 0, power: 0, sos: 0 };
    devices.forEach((device) => {
      const position = positions?.[device.id];
      const alarmResultState = getAlarmResultState(position);
      const isAlarmActive =
        alarmResultState !== null
          ? alarmResultState
          : position?.attributes?.alarm === true ||
            position?.attributes?.alarm === 'sos' ||
            position?.attributes?.alarm === 'active' ||
            position?.attributes?.out1 === true ||
            position?.attributes?.dout1 === true ||
            position?.attributes?.out1 === 1 ||
            position?.attributes?.dout1 === 1;
      if (isAlarmActive) {
        counts.sos += 1;
        return;
      }

      const statusInfo = getDeviceStatusInfo(device, position);
      if (statusInfo.category === 'arrow') {
        counts.moving += 1;
      } else if (statusInfo.category === 'pause') {
        counts.stationary += 1;
      } else {
        counts.power += 1;
      }
    });
    return counts;
  }, [devices, positions]);

  const getStatusLabel = (count, singular, plural) =>
    `${count} ${count === 1 ? singular : plural}`;

  return (
    <div className={classes.root}>
      <div className={classes.headerBox}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {`${getStatusLabel(statusCounts.moving, 'En movimiento', 'En movimiento')} ${getStatusLabel(statusCounts.stationary, 'Estacionado', 'Estacionados')} ${getStatusLabel(statusCounts.power, 'Apagado', 'Apagados')} ${getStatusLabel(statusCounts.sos, 'Peligro', 'Peligros')}`}
        </Typography>
        <IconButton size="small" onClick={runRefresh} color="primary">
          {updated ? (
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Actualizado</Typography>
          ) : (
            <RefreshIcon sx={{ fontSize: '1.2rem' }} />
          )}
        </IconButton>
      </div>
      <div ref={containerRef} className={classes.listContainer}>
        <List
          className={classes.list}
          rowComponent={DeviceRow}
          rowCount={devices.length}
          rowHeight={128}
          width={dimensions.width}
          height={dimensions.height}
          rowProps={{ devices }}
          overscanCount={5}
        />
      </div>
    </div>
  );
};

export default DeviceList;
