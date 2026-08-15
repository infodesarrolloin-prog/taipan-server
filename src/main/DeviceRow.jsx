import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';
import {
  Box,
  IconButton,
  Tooltip,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShareIcon from '@mui/icons-material/Share';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import Battery60Icon from '@mui/icons-material/Battery60';
import BatteryCharging60Icon from '@mui/icons-material/BatteryCharging60';
import Battery20Icon from '@mui/icons-material/Battery20';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { devicesActions } from '../store';
import {
  formatAlarm,
  formatAddress,
  formatBoolean,
  formatPercentage,
  formatStatus,
  formatSpeed,
  getStatusColor,
} from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import { getDeviceStatusInfo } from '../map/core/preloadImages';
import { useAdministrator } from '../common/util/permissions';
import EngineIcon from '../resources/images/data/engine.svg?react';
import { useAttributePreference } from '../common/util/preferences';
import { getAlarmResultState, isPowerCutPosition } from '../common/util/powerCutUtils';
import fetchOrThrow from '../common/util/fetchOrThrow';
import GeofencesValue from '../common/components/GeofencesValue';
import DriverValue from '../common/components/DriverValue';
import AddressValue from '../common/components/AddressValue';
import MotionBar from './components/MotionBar';

dayjs.extend(relativeTime);

const useStyles = makeStyles()((theme) => ({
  listItem: {
    // alignItems stretch so avatar and content fill the full row height
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
    // Slightly increased vertical padding to occupy white space better
    padding: theme.spacing(0.75, 1),
    boxSizing: 'border-box',
    borderRadius: theme.spacing(1.5),
    border: '1px solid transparent',
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(44,111,224,0.03)',
    transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeOut,
    }),
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,111,224,0.07)',
      borderColor:
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(44,111,224,0.18)',
      boxShadow: '0 6px 18px rgba(0,0,0,0.10)',
    },
    '&.Mui-selected': {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(93,155,255,0.18)' : 'rgba(44,111,224,0.12)',
      borderColor: theme.palette.primary.main,
      boxShadow: '0 10px 24px rgba(28,70,144,0.14)',
    },
    '&.Mui-selected:hover': {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(93,155,255,0.24)' : 'rgba(44,111,224,0.18)',
    },
    '&.Mui-focusVisible': {
      outline: `2px solid ${theme.palette.primary.light}`,
      outlineOffset: '2px',
    },
  },
  avatar: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: theme.spacing(1),
    width: '58px',
    minHeight: '100%',
    height: '100%',
    flexShrink: 0,
  },
  rightActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
  actionButton: {
    padding: '6px',
    color: theme.palette.text.secondary,
    border: '1px solid transparent',
    borderRadius: theme.spacing(1),
    flexShrink: 0,
    transition: theme.transitions.create(['background-color', 'border-color'], {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeOut,
    }),
    '&:hover': {
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,111,224,0.08)',
      borderColor:
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(44,111,224,0.22)',
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.primary.light}`,
      outlineOffset: '2px',
    },
  },
  // Address row: flex wrap so icons never squeeze the address text
  addressLine: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    minWidth: 0,
    marginTop: theme.spacing(0.5),
  },
  // Address text: flex:1 + minWidth:0 means it uses available space and wraps naturally
  addressText: {
    flex: 1,
    minWidth: 0,
    cursor: 'pointer',
    fontSize: '0.86rem',
    lineHeight: '1.25rem',
    color: theme.palette.text.secondary,
    transition: theme.transitions.create(['color', 'font-weight'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      fontWeight: 700,
      color: theme.palette.text.primary,
    },
    // Allow up to 2 lines — no artificial clamp that hides important info
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  // Bottom row: status text + status icons side by side
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minWidth: 0,
    marginTop: theme.spacing(0.5),
    gap: theme.spacing(0.5),
  },
  statusText: {
    color: theme.palette.text.secondary,
    fontSize: '0.78rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  // Status icons row — compact, non-wrapping
  statusIcons: {
    display: 'flex',
    alignItems: 'center',
    gap: '1px',
    flexShrink: 0,
  },
  success: { color: theme.palette.success.main },
  warning: { color: theme.palette.warning.main },
  error: { color: theme.palette.error.main },
  neutral: { color: theme.palette.neutral.main },
  selected: { borderColor: theme.palette.primary.main },
  danger: {
    borderColor: theme.palette.warning.main,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255,152,0,0.14)'
        : 'rgba(255,152,0,0.14)',
  },
}));

const DeviceRow = ({ devices, index, style }) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const admin = useAdministrator();
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const item = devices[index];
  const position = useSelector((state) => state.session.positions[item.id]);

  const devicePrimary = useAttributePreference('devicePrimary', 'name');
  const deviceSecondary = useAttributePreference('deviceSecondary', '');
  const speedUnit = useAttributePreference('speedUnit', 'kn');
  const geocoderEnabled = useSelector((state) => state.session.server.geocoderEnabled);
  const [copied, setCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const explicitAddress = position?.address || position?.attributes?.address;
  const addressText = explicitAddress || null;
  const showAddress = Boolean(position);
  const speed = position?.speed ?? position?.attributes?.speed;
  const activity = position?.attributes?.activity || position?.attributes?.motion || 'desconocida';

  const resolveFieldValue = (field) => {
    if (field === 'geofenceIds') {
      const geofenceIds = position?.geofenceIds;
      return geofenceIds?.length ? <GeofencesValue geofenceIds={geofenceIds} /> : null;
    }
    if (field === 'driverUniqueId') {
      const driverUniqueId = position?.attributes?.driverUniqueId;
      return driverUniqueId ? <DriverValue driverUniqueId={driverUniqueId} /> : null;
    }
    if (field === 'motion') {
      return <MotionBar deviceId={item.id} />;
    }
    return item[field];
  };

  const primaryValue = resolveFieldValue(devicePrimary);
  const secondaryValue = resolveFieldValue(deviceSecondary);

  const status =
    item.status === 'online' || !item.lastUpdate
      ? formatStatus(item.status, t)
      : dayjs(item.lastUpdate).fromNow();

  const statusTooltip = item.lastUpdate
    ? `Último reporte: ${new Date(item.lastUpdate).toLocaleString('es-CO', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : 'Último reporte no disponible';

  const statusColor = (() => {
    if (item.status !== 'online') {
      return getStatusColor(item.status);
    }
    if (!item.lastUpdate) {
      return 'neutral';
    }
    const hours = dayjs().diff(item.lastUpdate, 'hours');
    if (hours >= 48) return 'error';
    if (hours >= 24) return 'warning';
    return 'success';
  })();

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

  const getCopyAddressFromPosition = async () => {
    if (!position) return '';
    const explicit = position?.address || position?.attributes?.address;
    if (explicit) return explicit;
    const coordinateAddress = formatAddress({ latitude: position.latitude, longitude: position.longitude });
    if (!geocoderEnabled) return coordinateAddress;
    try {
      const query = new URLSearchParams({ latitude: position.latitude, longitude: position.longitude });
      const response = await fetchOrThrow(`/api/server/geocode?${query.toString()}`);
      const resolvedAddress = (await response.text()).trim();
      return resolvedAddress || coordinateAddress;
    } catch {
      return coordinateAddress;
    }
  };

  const handleAvatarClick = (event) => {
    event.stopPropagation();
    dispatch(devicesActions.selectId({ id: item.id, source: 'avatar' }));
  };

  const handleAlarmClick = (event) => {
    event.stopPropagation();
  };

  const handleBatteryClick = (event) => {
    event.stopPropagation();
  };


  const openLocation = async (event) => {
    event.stopPropagation();
    if (!position) return;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}`;
    window.open(mapsLink, '_blank', 'noopener');
  };

  const handleCopyAddress = async (event) => {
    event?.stopPropagation();
    const address = await getCopyAddressFromPosition();
    if (!address) return;
    const copied = await copyTextToClipboard(address);
    if (copied) {
      setAddressCopied(true);
      window.setTimeout(() => setAddressCopied(false), 1200);
    }
  };

  const shareReport = async (event) => {
    event.stopPropagation();
    if (!position) return;
    const plate = item.name || item.uniqueId || item.id;
    const addressTextToCopy = await getCopyAddressFromPosition();
    const coordinateString = `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`;
    const fixTimeValue = position.fixTime || item.lastUpdate || null;
    const fixTime = fixTimeValue
      ? new Date(fixTimeValue).toLocaleString('es-CO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'desconocida';
    const speedText = speed ? formatSpeed(speed, speedUnit, t) : 'desconocida';
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${position.latitude},${position.longitude}`;
    const message = `Automovil ${plate} esta ubicado en ${addressTextToCopy} con coordenadas ${coordinateString} con hora de reporte ${fixTime} a una velocidad ${speedText} con actividad ${activity} y ubicado en google maps ${mapsLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reporte - ${plate}`,
          text: message,
        });
      } catch {
        try {
          await navigator.clipboard.writeText(message);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          // silent fallback
        }
      }
    } else {
      navigate(`/settings/device/${item.id}/share`);
    }
  };

  const statusInfo = getDeviceStatusInfo(item, position);

  const ignitionPowered =
    position?.attributes?.ignition === true ||
    position?.attributes?.ignition === 'true' ||
    position?.attributes?.ignition === 1 ||
    position?.attributes?.ignition === '1';

  const avatarStatusLabel =
    statusInfo.category === 'pause'
      ? 'Estacionado'
      : statusInfo.category === 'arrow'
      ? 'En Movimiento'
      : statusInfo.category === 'power'
      ? 'Apagado'
      : formatStatus(item.status, t);

  // --- Telemetry-based status flags ---
  const isPowerCut = isPowerCutPosition(position);
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

  return (
    <div style={{ ...style, padding: '6px 6px 4px', boxSizing: 'border-box' }}>
      <ListItemButton
        key={item.id}
        onClick={() => {
          dispatch(devicesActions.selectId({ id: item.id, source: 'list' }));
        }}
        disabled={!admin && item.disabled}
        selected={selectedDeviceId === item.id}
        className={`${selectedDeviceId === item.id ? classes.selected : ''} ${isAlarmActive ? classes.danger : ''} ${classes.listItem}`}
      >
        <ListItemAvatar
          onClick={handleAvatarClick}
          sx={{ minWidth: 56, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', mr: 1.25, pt: 0.5 }}
        >
          <Tooltip title={avatarStatusLabel} arrow PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 6] } }] }}>
            <span>
              <Avatar
                variant="rounded"
                className={classes.avatar}
                sx={{
                  backgroundColor: isPowerCut
                    ? 'rgba(244,67,54,0.16)'
                    : isAlarmActive
                    ? 'rgba(255,152,0,0.18)'
                    : theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(44,111,224,0.12)',
                  borderColor: isPowerCut
                    ? theme.palette.error.main
                    : isAlarmActive
                    ? theme.palette.warning.main
                    : theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.12)'
                    : 'rgba(44,111,224,0.18)',
                }}
              >
                {statusInfo.category === 'arrow' && (
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    style={{
                      fill: theme.palette.success.main,
                      transform: `rotate(${statusInfo.rotation}deg)`,
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                  </svg>
                )}
                {statusInfo.category === 'pause' && (
                  <svg viewBox="0 0 24 24" width="14" height="14" style={{ fill: '#FBBF24' }}>
                    <rect x="5" y="4" width="4" height="16" rx="1" />
                    <rect x="15" y="4" width="4" height="16" rx="1" />
                  </svg>
                )}
                {statusInfo.category === 'power' && (
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    style={{ fill: theme.palette.error.main }}
                  >
                    <path d="M12 2c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm4.82 2.37c-.59-.59-1.54-.59-2.12 0-.59.59-.59 1.54 0 2.12C16.43 8.22 17.5 10 17.5 12c0 3.03-2.47 5.5-5.5 5.5S6.5 15.03 6.5 12c0-2 .97-3.69 2.47-4.78.62-.45.72-1.34.22-1.92-.47-.55-1.32-.63-1.89-.18C5.07 6.94 3.5 9.28 3.5 12c0 4.69 3.81 8.5 8.5 8.5s8.5-3.81 8.5-8.5c0-2.81-1.38-5.3-3.48-6.83z" />
                  </svg>
                )}
              </Avatar>
            </span>
          </Tooltip>
          {position?.attributes?.hasOwnProperty('ignition') && (
            <Tooltip
              title={ignitionPowered ? 'Con Energia' : 'Sin Energia'}
              arrow
            >
              <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <EngineIcon
                  width={18}
                  height={18}
                  className={ignitionPowered ? classes.success : classes.neutral}
                />
              </Box>
            </Tooltip>
          )}
          <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: theme.spacing(0.5), alignItems: 'center', width: '100%' }}>
            {position?.attributes?.hasOwnProperty('alarm') && (
              <Tooltip title={isAlarmActive ? 'En Peligro' : 'Alarm status'} arrow>
                <IconButton
                  size="small"
                  onClick={handleAlarmClick}
                  sx={{ padding: '4px', width: 28, height: 28 }}
                  aria-label="SOS"
                >
                  <ErrorIcon sx={{ fontSize: '1rem', color: isAlarmActive ? theme.palette.error.main : theme.palette.text.secondary }} />
                </IconButton>
              </Tooltip>
            )}
            {position?.attributes?.batteryLevel != null && (
              <Tooltip title={position.attributes.batteryLevel != null ? `${formatPercentage(position.attributes.batteryLevel)}` : 'Batería desconocida'} arrow>
                <IconButton
                  size="small"
                  onClick={handleBatteryClick}
                  sx={{ padding: '4px', width: 28, height: 28 }}
                  aria-label="Batería"
                >
                  {(position.attributes.batteryLevel > 70 &&
                    (position.attributes.charge ? (
                      <BatteryChargingFullIcon sx={{ fontSize: '1rem', color: theme.palette.success.main }} />
                    ) : (
                      <BatteryFullIcon sx={{ fontSize: '1rem', color: theme.palette.success.main }} />
                    ))) ||
                    (position.attributes.batteryLevel > 30 &&
                      (position.attributes.charge ? (
                        <BatteryCharging60Icon sx={{ fontSize: '1rem', color: theme.palette.warning.main }} />
                      ) : (
                        <Battery60Icon sx={{ fontSize: '1rem', color: theme.palette.warning.main }} />
                      ))) ||
                    (position.attributes.charge ? (
                      <BatteryCharging20Icon sx={{ fontSize: '1rem', color: theme.palette.error.main }} />
                    ) : (
                      <Battery20Icon sx={{ fontSize: '1rem', color: theme.palette.error.main }} />
                    ))}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </ListItemAvatar>

        {/*
         * ListItemText takes all remaining width.
         * Status icons are NOW inside this column (statusRow),
         * so they NEVER compete with the address text for horizontal space.
         */}
        <ListItemText
          style={{ minWidth: 0, margin: 0 }}
          disableTypography
          primary={
            <Box sx={{ display: 'flex', width: '100%', minWidth: 0, alignItems: 'stretch', gap: theme.spacing(1) }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, justifyContent: 'space-between', gap: theme.spacing(0.75) }}>
                {/* Row 1: Device name */}
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: 700, fontSize: '0.98rem', lineHeight: '1.3' }}
                >
                  {primaryValue}
                </Typography>

                {/* Row 2: Address */}
                {showAddress && (
                  <Box className={classes.addressLine}>
                    <Tooltip
                      title={addressCopied ? 'Dirección copiada' : 'Copiar dirección'}
                      arrow
                    >
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyAddress();
                        }}
                        style={{ cursor: 'pointer', width: '100%' }}
                      >
                        <Typography
                          className={classes.addressText}
                          component="span"
                        >
                          {addressText ? (
                            addressText
                          ) : (
                            <AddressValue
                              latitude={position.latitude}
                              longitude={position.longitude}
                              originalAddress={position.address || position.attributes?.address}
                              positionKey={position.fixTime || position.serverTime}
                            />
                          )}
                        </Typography>
                      </span>
                    </Tooltip>
                  </Box>
                )}

                {/* Row 3: Status text + indicators + ALL status icons */}
                <Box className={classes.statusRow}>
                  <Typography
                    className={`${classes.statusText} ${classes[statusColor]}`}
                    component="span"
                    sx={{
                      fontSize: '0.82rem',
                      cursor: 'default',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                        {isPowerCut && (
                          <WarningIcon
                            sx={{
                              fontSize: '0.85rem',
                              color: 'error.main',
                              verticalAlign: 'text-bottom',
                              mr: 0.3,
                            }}
                          />
                        )}
                        {isPowerCut && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'error.main',
                              mr: 0.5,
                            }}
                          >
                            Cortada
                          </Typography>
                        )}
                                {secondaryValue && (
                          <>
                            {secondaryValue}
                            {' '}
                          </>
                        )}
                        <Tooltip title={statusTooltip} arrow>
                          <span>
                            {status}
                          </span>
                        </Tooltip>
                      </Typography>

              </Box>
            </Box>
            <Box className={classes.rightActions}>
                <Tooltip title={copied ? 'Reporte copiado' : 'Compartir reporte'} arrow>
                  <span>
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      onClick={shareReport}
                      aria-label="Compartir reporte"
                    >
                      <ShareIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Abrir en Google Maps" arrow>
                  <span>
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      onClick={openLocation}
                      aria-label="Abrir en Google Maps"
                    >
                      <LocationOnIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Ver Reportes" arrow>
                  <span>
                    <IconButton
                      size="small"
                      className={classes.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reports/combined?deviceId=${item.id}`);
                      }}
                      aria-label="Ver Reportes"
                    >
                      <DescriptionIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          }
        />
      </ListItemButton>
    </div>
  );
};

export default DeviceRow;
