import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  TableFooter,
  Link,
  Tooltip,
  Box,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import RouteIcon from '@mui/icons-material/Route';
import PendingIcon from '@mui/icons-material/Pending';
import PowerIcon from '@mui/icons-material/Power';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import WarningIcon from '@mui/icons-material/Warning';
import SendIcon from '@mui/icons-material/Send';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import AddressValue from './AddressValue';
import { useDeviceReadonly, useRestriction } from '../util/permissions';
import { formatAddress, formatDistance, formatBoolean } from '../util/formatter';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import { getDeviceStatusInfo } from '../../map/core/preloadImages';
import { isPowerCutPosition, isPowerCutResultText, isPowerRestoreResultText, isIgnitionOffResultText, getAlarmResultState } from '../util/powerCutUtils';
import fetchOrThrow from '../util/fetchOrThrow';
import EngineIcon from '../../resources/images/data/engine.svg?react';

const useStyles = makeStyles()((theme, { desktopPadding }) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
    borderRadius: '18px !important',
    overflow: 'hidden',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.90)' : 'rgba(242,246,255,0.92)',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 24px 64px rgba(0,0,0,0.36), 0 0 0 1px rgba(255,255,255,0.04)'
        : '0 16px 48px rgba(30,60,120,0.16), 0 0 0 1px rgba(44,111,224,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.25, 1.5, 0.5, 2),
    color: theme.palette.text.secondary,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    '& > div': {
      color: theme.palette.common.white,
      mixBlendMode: 'difference',
    },
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiTableCell-sizeSmall:first-of-type': {
      paddingRight: theme.spacing(1),
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
    padding: theme.spacing(0.5, 1),
  },
  root: {
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(2)} + 88px)`,
    },
    transform: 'translateX(-50%)',
  },
}));

const StatusRow = ({ name, content }) => {
  const { classes } = useStyles({ desktopPadding: 0 });

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">
          {content}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const { classes } = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();
  const theme = useTheme();

  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);
  const groups = useSelector((state) => state.groups.items);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference(
    'positionItems',
    'fixTime,address,speed,totalDistance',
  );

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingPower, setPendingPower] = useState(false);
  const [pendingAlarm, setPendingAlarm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [addressCopied, setAddressCopied] = useState(false);
  const [forcePowerCut, setForcePowerCut] = useState(null);
  const [forceAlarmActive, setForceAlarmActive] = useState(null);

  // Refs to track pre-command telemetry state
  const prevPowerRef = useRef(null);
  const prevAlarmRef = useRef(null);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetchOrThrow('/api/devices');
      dispatch(devicesActions.refresh(await response.json()));
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    const item = await response.json();
    await fetchOrThrow('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
    });
    navigate(`/settings/geofence/${item.id}`);
  }, [navigate, position, t]);

  const distanceUnit = useAttributePreference('distanceUnit');
  const [distanceToday, setDistanceToday] = useState(null);

  useEffect(() => {
    if (!deviceId) return;
    let active = true;
    const fetchDistance = async () => {
      try {
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        const to = new Date();
        to.setHours(23, 59, 59, 999);
        const query = new URLSearchParams({
          deviceId,
          from: from.toISOString(),
          to: to.toISOString(),
        });
        const response = await fetchOrThrow(`/api/reports/summary?${query.toString()}`);
        const data = await response.json();
        if (active && data && data.length > 0) {
          setDistanceToday(data[0].distance);
        }
      } catch {
        // fail silently
      }
    };
    fetchDistance();
    return () => {
      active = false;
    };
  }, [deviceId]);

  // --- Telemetry-based state flags ---
  // DOUT2 = power cut relay, DOUT1 = alarm/siren
  const rawPowerCut = isPowerCutPosition(position);
  const isPowerCut = forcePowerCut !== null ? forcePowerCut : rawPowerCut;

  const alarmResultState = getAlarmResultState(position);
  const rawAlarmActive =
    position?.attributes?.alarm === true ||
    position?.attributes?.alarm === 'sos' ||
    position?.attributes?.alarm === 'active' ||
    position?.attributes?.out1 === true ||
    position?.attributes?.dout1 === true ||
    position?.attributes?.out1 === 1 ||
    position?.attributes?.dout1 === 1;

  const isAlarmActive =
    forceAlarmActive !== null
      ? forceAlarmActive
      : alarmResultState !== null
      ? alarmResultState
      : rawAlarmActive;

  const isIgnitionOn = position?.attributes?.ignition === true;

  const isPowerCutResponse = isPowerCutResultText(position);
  const isPowerRestoreResponse = isPowerRestoreResultText(position);
  const isAlarmOnResponse = alarmResultState === true;
  const isAlarmOffResponse = alarmResultState === false;
  const isIgnitionOffResponse = isIgnitionOffResultText(position);

  // Device avatar info
  const statusInfo = device ? getDeviceStatusInfo(device, position) : null;

  const sendPowerCommand = useCatchCallback(async (powerCut) => {
    const getCommandId = (key) => {
      const devVal = device?.attributes?.[key];
      if (devVal) return devVal;
      const gId = device?.groupId;
      if (gId && groups[gId]) return groups[gId].attributes?.[key] || null;
      return null;
    };

    const savedIdKey = powerCut ? 'cutPowerCommandId' : 'restorePowerCommandId';
    const legacyKey = powerCut ? 'cutPowerCommand' : 'restorePowerCommand';
    const defaultType = powerCut ? 'engineStop' : 'engineResume';

    const cmdId = getCommandId(savedIdKey);
    let command;
    if (cmdId) {
      const res = await fetchOrThrow(`/api/commands/${cmdId}`);
      const savedCmd = await res.json();
      command = {
        deviceId: parseInt(deviceId, 10),
        type: savedCmd.type || 'custom',
        attributes: savedCmd.attributes || {},
      };
    } else {
      const legacyText = device?.attributes?.[legacyKey];
      command = legacyText
        ? { deviceId: parseInt(deviceId, 10), type: 'custom', attributes: { data: legacyText } }
        : { deviceId: parseInt(deviceId, 10), type: defaultType };
    }

    setSending(true);
    prevPowerRef.current = rawPowerCut;
    setForcePowerCut(powerCut);
    setConfirmation(null);
    try {
      await fetchOrThrow('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      setPendingPower(true);
    } finally {
      setSending(false);
    }
  }, [deviceId, rawPowerCut, device, groups]);

  const sendAlarmCommand = useCatchCallback(async (alarmOn) => {
    const getCommandId = (key) => {
      const devVal = device?.attributes?.[key];
      if (devVal) return devVal;
      const gId = device?.groupId;
      if (gId && groups[gId]) return groups[gId].attributes?.[key] || null;
      return null;
    };

    const savedIdKey = alarmOn ? 'alarmOnCommandId' : 'alarmOffCommandId';
    const legacyKey = alarmOn ? 'alarmOnCommand' : 'alarmOffCommand';
    const defaultType = alarmOn ? 'alarmArm' : 'alarmDisarm';

    const cmdId = getCommandId(savedIdKey);
    let command;
    if (cmdId) {
      const res = await fetchOrThrow(`/api/commands/${cmdId}`);
      const savedCmd = await res.json();
      command = {
        deviceId: parseInt(deviceId, 10),
        type: savedCmd.type || 'custom',
        attributes: savedCmd.attributes || {},
      };
    } else {
      const legacyText = device?.attributes?.[legacyKey];
      command = legacyText
        ? { deviceId: parseInt(deviceId, 10), type: 'custom', attributes: { data: legacyText } }
        : { deviceId: parseInt(deviceId, 10), type: defaultType };
    }

    setSending(true);
    prevAlarmRef.current = rawAlarmActive;
    setForceAlarmActive(alarmOn);
    setConfirmation(null);
    try {
      await fetchOrThrow('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      setPendingAlarm(true);
    } finally {
      setSending(false);
    }
  }, [deviceId, rawAlarmActive, device, groups]);

  const handlePowerToggle = () => {
    setConfirmation({
      type: 'power',
      action: isPowerCut ? 'restaurar' : 'cortar',
      confirmLabel: isPowerCut ? 'Restaurar Energía' : 'Cortar Energía',
      onConfirm: () => sendPowerCommand(!isPowerCut),
    });
  };

  const handleAlarmToggle = () => {
    setConfirmation({
      type: 'alarm',
      action: isAlarmActive ? 'desactivar' : 'activar',
      confirmLabel: isAlarmActive ? 'Desactivar Alarma' : 'Activar Alarma',
      onConfirm: () => sendAlarmCommand(!isAlarmActive),
    });
  };

  // Auto-clear pending when telemetry confirms state change + show success message
  useEffect(() => {
    if (pendingPower) {
      if (isPowerCutResponse) {
        setForcePowerCut(true);
      } else if (isPowerRestoreResponse) {
        setForcePowerCut(false);
      }
    }
  }, [pendingPower, isPowerCutResponse, isPowerRestoreResponse]);

  useEffect(() => {
    if (!pendingPower || prevPowerRef.current === null) return;

    const stateChanged = rawPowerCut !== prevPowerRef.current;
    const responseConfirmed = isPowerCutResponse || isPowerRestoreResponse;

    if (stateChanged || responseConfirmed) {
      setPendingPower(false);
      if (isPowerCut) {
        if (!isIgnitionOn || isIgnitionOffResponse) {
          setSuccessMsg('Tarea completada — Corte realizado con éxito');
        } else {
          setSuccessMsg('Corte de energía confirmado');
        }
      } else {
        setSuccessMsg('Energía restaurada — Ya puedes encender tu vehículo');
      }
      prevPowerRef.current = null;
    }
  }, [rawPowerCut, pendingPower, isIgnitionOn, isIgnitionOffResponse, isPowerCutResponse, isPowerRestoreResponse, isPowerCut]);

  useEffect(() => {
    if (forcePowerCut === null || pendingPower) return;
    setForcePowerCut(null);
  }, [forcePowerCut, pendingPower, rawPowerCut]);

  useEffect(() => {
    if (forceAlarmActive === null || pendingAlarm) return;
    setForceAlarmActive(null);
  }, [forceAlarmActive, pendingAlarm, rawAlarmActive]);

  useEffect(() => {
    if (!pendingAlarm || prevAlarmRef.current === null) return;

    const stateChanged = rawAlarmActive !== prevAlarmRef.current;
    const responseConfirmed = isAlarmOnResponse || isAlarmOffResponse;

    if (stateChanged || responseConfirmed) {
      setPendingAlarm(false);
      if (isAlarmActive || isAlarmOnResponse) {
        setSuccessMsg('🔔 Alarma activada con éxito');
      } else {
        setSuccessMsg('🔕 Alarma desactivada con éxito');
      }
      prevAlarmRef.current = null;
    }
  }, [rawAlarmActive, isAlarmActive, pendingAlarm, isAlarmOnResponse, isAlarmOffResponse]);

  // Timeout: auto-clear pending after 120s if no telemetry confirmation
  useEffect(() => {
    if (!pendingPower) return undefined;
    const timer = setTimeout(() => setPendingPower(false), 120000);
    return () => clearTimeout(timer);
  }, [pendingPower]);

  useEffect(() => {
    if (!pendingAlarm) return undefined;
    const timer = setTimeout(() => setPendingAlarm(false), 120000);
    return () => clearTimeout(timer);
  }, [pendingAlarm]);

  // Copy address to clipboard
  const copyTextToClipboard = async (text) => {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch {
        return false;
      }
    }
  };

  const handleCopyAddress = async () => {
    if (!position) return;
    const address = position?.address || position?.attributes?.address;
    const fallbackAddress = address || formatAddress({ latitude: position.latitude, longitude: position.longitude });
    const copied = await copyTextToClipboard(fallbackAddress);
    if (copied) {
      setAddressCopied(true);
      setSuccessMsg('📋 Dirección copiada al portapapeles');
      window.setTimeout(() => setAddressCopied(false), 1600);
    }
  };

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Rnd
            default={{ x: 0, y: 0, width: 'auto', height: 'auto' }}
            enableResizing={false}
            dragHandleClassName="draggable-header"
            style={{ position: 'relative' }}
          >
            <Card elevation={3} className={classes.card}>
              <div className={`draggable-header ${classes.header}`}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: (th) => `1.5px solid ${th.palette.divider}`,
                    backgroundColor: (th) =>
                      th.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                    minWidth: '60px',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: 'text.primary',
                    }}
                  >
                    {device.name}
                  </Typography>
                </Box>
                <IconButton size="small" color="inherit" onClick={onClose} onTouchStart={onClose}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
              {deviceImage && (
                <CardMedia
                  className={classes.media}
                  image={`/api/media/${device.uniqueId}/${deviceImage}`}
                />
              )}
              {/* Status warning banners */}
              {isPowerCut && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    backgroundColor: 'rgba(244,67,54,0.12)',
                    borderBottom: '1px solid rgba(244,67,54,0.25)',
                  }}
                >
                  <WarningIcon sx={{ color: 'error.main', fontSize: '1.1rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                    Corriente Cortada
                  </Typography>
                </Box>
              )}
              {isAlarmActive && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    backgroundColor: 'rgba(255,152,0,0.12)',
                    borderBottom: '1px solid rgba(255,152,0,0.25)',
                  }}
                >
                  <NotificationsActiveIcon sx={{ color: 'warning.main', fontSize: '1.1rem' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    Alarma Activa
                  </Typography>
                </Box>
              )}
              {position && (
                <CardContent className={classes.content}>
                  <Table size="small" className={classes.table}>
                    <TableBody>
                      {positionItems
                        .split(',')
                        .filter(
                          (key) =>
                            position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key),
                        )
                        .map((key) => (
                          <StatusRow
                            key={key}
                            name={
                              key === 'fixTime'
                                ? 'Último Reporte'
                                : positionAttributes[key]?.name || key
                            }
                            content={
                              key === 'address' ? (
                                <Typography
                                  variant="body2"
                                  color={addressCopied ? 'text.primary' : 'text.secondary'}
                                  onClick={handleCopyAddress}
                                  sx={{
                                    cursor: 'pointer',
                                    fontWeight: addressCopied ? 700 : 400,
                                    '&:hover': { fontWeight: 700, color: 'text.primary' },
                                    '&:active': { fontWeight: 700 },
                                    transition: 'all 0.15s',
                                  }}
                                >
                                  <AddressValue
                                    latitude={position.latitude}
                                    longitude={position.longitude}
                                    originalAddress={position.address || position.attributes?.address}
                                    positionKey={position.fixTime || position.serverTime}
                                  />
                                </Typography>
                              ) : (
                                <PositionValue
                                  position={position}
                                  property={position.hasOwnProperty(key) ? key : null}
                                  attribute={position.hasOwnProperty(key) ? null : key}
                                />
                              )
                            }
                          />
                        ))}
                      {distanceToday !== null && (
                        <StatusRow
                          name="Distancia recorrida hoy"
                          content={formatDistance(distanceToday, distanceUnit, t)}
                        />
                      )}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={2} className={classes.cell}>
                          <Typography variant="body2">
                            <Link component={RouterLink} to={`/position/${position.id}`}>
                              {t('sharedShowDetails')}
                            </Link>
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              )}
              <CardActions className={classes.actions} disableSpacing>
                <Tooltip title={t('sharedExtra')}>
                  <IconButton
                    color="secondary"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <PendingIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('reportReplay')}>
                  <IconButton
                    onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
                    disabled={disableActions || !position}
                  >
                    <RouteIcon />
                  </IconButton>
                </Tooltip>
                {/* Device avatar icon (arrow/pause/power) instead of static PowerSettingsNew */}
                <Tooltip title={`Estado: ${device.status}`}>
                  <span>
                    <IconButton disabled sx={{ position: 'relative' }}>
                      {statusInfo?.category === 'arrow' && (
                        <svg
                          viewBox="0 0 24 24"
                          width="22"
                          height="22"
                          style={{
                            fill: theme.palette.success.main,
                            transform: `rotate(${statusInfo.rotation}deg)`,
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                        </svg>
                      )}
                      {statusInfo?.category === 'pause' && (
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          style={{ fill: '#FBBF24' }}
                        >
                          <rect x="5" y="4" width="4" height="16" rx="1" />
                          <rect x="15" y="4" width="4" height="16" rx="1" />
                        </svg>
                      )}
                      {statusInfo?.category === 'power' && (
                        <svg
                          viewBox="0 0 24 24"
                          width="22"
                          height="22"
                          style={{ fill: theme.palette.error.main }}
                        >
                          <path d="M12 2c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm4.82 2.37c-.59-.59-1.54-.59-2.12 0-.59.59-.59 1.54 0 2.12C16.43 8.22 17.5 10 17.5 12c0 3.03-2.47 5.5-5.5 5.5S6.5 15.03 6.5 12c0-2 .97-3.69 2.47-4.78.62-.45.72-1.34.22-1.92-.47-.55-1.32-.63-1.89-.18C5.07 6.94 3.5 9.28 3.5 12c0 4.69 3.81 8.5 8.5 8.5s8.5-3.81 8.5-8.5c0-2.81-1.38-5.3-3.48-6.83z" />
                        </svg>
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
                {/* Ignition indicator */}
                {position?.attributes?.hasOwnProperty('ignition') && (
                  <Tooltip
                    title={`${t('positionIgnition')}: ${formatBoolean(position.attributes.ignition, t)}`}
                  >
                    <span>
                      <IconButton disabled sx={{ '&.Mui-disabled': { color: 'inherit' } }}>
                        <EngineIcon
                          width={20}
                          height={20}
                          style={{
                            color: isIgnitionOn
                              ? theme.palette.success.main
                              : theme.palette.text.disabled,
                          }}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {/* Power cut */}
                <Tooltip
                  title={
                    pendingPower
                      ? 'Esperando confirmación del GPS...'
                      : 'Cortar Energía'
                  }
                >
                  <span>
                    <IconButton
                      onClick={() =>
                        setConfirmation({
                          type: 'power',
                          action: 'cortar',
                          confirmLabel: 'Cortar Energía',
                          onConfirm: () => sendPowerCommand(true),
                        })
                      }
                      disabled={
                        disableActions || readonly || deviceReadonly || sending || pendingPower || isPowerCut
                      }
                      sx={{
                        color: theme.palette.error.main,
                        position: 'relative',
                        ...(pendingPower && {
                          animation: 'pulse 1.5s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.4 },
                          },
                        }),
                      }}
                    >
                      <PowerOffIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    pendingPower
                      ? 'Esperando confirmación del GPS...'
                      : 'Restaurar Energía'
                  }
                >
                  <span>
                    <IconButton
                      onClick={() =>
                        setConfirmation({
                          type: 'power',
                          action: 'restaurar',
                          confirmLabel: 'Restaurar Energía',
                          onConfirm: () => sendPowerCommand(false),
                        })
                      }
                      disabled={disableActions || readonly || deviceReadonly || sending || pendingPower}
                      sx={{
                        color: theme.palette.success.main,
                        position: 'relative',
                        ...(pendingPower && {
                          animation: 'pulse 1.5s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.4 },
                          },
                        }),
                      }}
                    >
                      <PowerIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                {/* Alarm toggle */}
                <Tooltip
                  title={
                    pendingAlarm
                      ? 'Esperando confirmación del GPS...'
                      : isAlarmActive
                        ? 'Desactivar Alarma'
                        : 'Activar Alarma'
                  }
                >
                  <IconButton
                    onClick={handleAlarmToggle}
                    disabled={
                      disableActions || readonly || deviceReadonly || sending || pendingAlarm
                    }
                    sx={{
color: isAlarmActive
                         ? theme.palette.warning.main
                         : theme.palette.primary.main,
                      position: 'relative',
                      ...(pendingAlarm && {
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        },
                      }),
                    }}
                  >
                    {isAlarmActive ? <NotificationsActiveIcon /> : <NotificationsOffIcon />}
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Rnd>
        )}
      </div>
      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate(`/settings/device/${deviceId}/connections`);
            }}
            disabled={disableActions}
          >
            <LinkIcon sx={{ fontSize: '1rem', mr: 1, opacity: 0.7 }} />
            Comandos guardados
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate(`/settings/device/${deviceId}/command`);
            }}
            disabled={disableActions}
          >
            <SendIcon sx={{ fontSize: '1rem', mr: 1, opacity: 0.7 }} />
            {t('commandTitle') || 'Enviar comando'}
          </MenuItem>
          <MenuItem
            onClick={() => navigate(`/stream?deviceId=${deviceId}`)}
            disabled={position.protocol !== 'jt808'}
          >
            {t('linkLiveVideo')}
          </MenuItem>
          {!readonly && <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>}
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
          >
            {t('linkGoogleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}
          >
            {t('linkAppleMaps')}
          </MenuItem>
          <MenuItem
            component="a"
            target="_blank"
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}
          >
            {t('linkStreetView')}
          </MenuItem>
          {navigationAppTitle && navigationAppLink && (
            <MenuItem
              component="a"
              target="_blank"
              href={navigationAppLink
                .replace('{latitude}', position.latitude)
                .replace('{longitude}', position.longitude)}
            >
              {navigationAppTitle}
            </MenuItem>
          )}
          {!shareDisabled && !user.temporary && (
            <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}>
              <Typography color="secondary">{t('sharedShare')}</Typography>
            </MenuItem>
          )}
        </Menu>
      )}
      <Dialog open={Boolean(confirmation)} onClose={() => setConfirmation(null)}>
        <DialogTitle>{confirmation?.confirmLabel}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Deseas {confirmation?.action} {device?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmation(null)}>{t('sharedCancel') || 'Cancelar'}</Button>
          <Button
            onClick={confirmation?.onConfirm}
            disabled={sending}
            variant="contained"
            color="primary"
          >
            {confirmation?.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
      {/* Floating success message */}
      <Snackbar
        open={Boolean(successMsg)}
        onClose={() => setSuccessMsg('')}
        autoHideDuration={4000}
        message={successMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '14px',
            backdropFilter: 'blur(14px)',
            fontWeight: 600,
            fontSize: '0.85rem',
            minWidth: 'auto',
            padding: '6px 20px',
          },
        }}
      />
    </>
  );
};

export default StatusCard;
