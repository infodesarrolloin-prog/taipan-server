import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Box,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';
import LinkField from '../common/components/LinkField';
import { useTranslation } from '../common/components/LocalizationProvider';
import SettingsMenu from './components/SettingsMenu';
import { formatNotificationTitle } from '../common/util/formatter';
import PageLayout from '../common/components/PageLayout';
import useFeatures from '../common/util/useFeatures';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';

// Color/icon map for each dynamic button slot
const buttonSlots = [
  { key: 'cutPowerCommandId', label: 'Cortar Energía', color: '#e53935', Icon: PowerOffIcon },
  { key: 'restorePowerCommandId', label: 'Restaurar Energía', color: '#43a047', Icon: ElectricalServicesIcon },
  {
    key: 'alarmOnCommandId',
    label: 'Activar Alarma',
    color: '#fb8c00',
    Icon: AlarmOnIcon,
  },
  {
    key: 'alarmOffCommandId',
    label: 'Desactivar Alarma',
    color: '#1e88e5',
    Icon: AlarmOffIcon,
  },
];

const DeviceConnectionsPage = () => {
  const { classes } = useSettingsStyles();
  const t = useTranslation();

  const { id } = useParams();

  const features = useFeatures();

  const [device, setDevice] = useState(null);
  const [commands, setCommands] = useState([]);
  const [localAttrs, setLocalAttrs] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const loadData = async () => {
      try {
        const devRes = await fetchOrThrow(`/api/devices?id=${id}`, { signal: controller.signal });
        const devData = await devRes.json();
        if (devData.length > 0) {
          setDevice(devData[0]);
          setLocalAttrs({
            cutPowerCommandId: devData[0].attributes?.cutPowerCommandId || '',
            restorePowerCommandId: devData[0].attributes?.restorePowerCommandId || '',
            alarmOnCommandId: devData[0].attributes?.alarmOnCommandId || '',
            alarmOffCommandId: devData[0].attributes?.alarmOffCommandId || '',
          });
        }
      } catch {
        // ignore abort / errors
      }
      try {
        const cmdRes = await fetchOrThrow('/api/commands', { signal: controller.signal });
        const cmdData = await cmdRes.json();
        setCommands(cmdData);
      } catch {
        // ignore abort / errors
      }
    };
    loadData();
    return () => controller.abort();
  }, [id]);

  const handleSlotChange = useCallback((key, val) => {
    setLocalAttrs((prev) => ({ ...prev, [key]: val ? Number(val) : '' }));
    setDirty(true);
  }, []);

  const handleRemoveSlot = useCallback((key) => {
    setLocalAttrs((prev) => ({ ...prev, [key]: '' }));
    setDirty(true);
  }, []);

  const handleSaveAll = async () => {
    if (!device) return;
    setSaving(true);
    try {
      const cleanAttrs = { ...device.attributes };
      buttonSlots.forEach(({ key }) => {
        if (localAttrs[key]) {
          cleanAttrs[key] = localAttrs[key];
        } else {
          delete cleanAttrs[key];
        }
      });
      const updatedDevice = { ...device, attributes: cleanAttrs };
      const response = await fetchOrThrow(`/api/devices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDevice),
      });
      if (response.ok) {
        setDevice(await response.json());
        setDirty(false);
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  // Find command name by ID
  const getCommandName = (cmdId) => {
    const cmd = commands.find((c) => c.id === cmdId);
    return cmd?.description || cmd?.type || `ID: ${cmdId}`;
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedDevice', 'sharedConnections']}
    >
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('sharedConnections')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <LinkField
              endpointAll="/api/devices"
              endpointLinked={`/api/devices?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="linkedDeviceId"
              label={t('deviceTitle')}
            />
            <LinkField
              endpointAll="/api/geofences"
              endpointLinked={`/api/geofences?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="geofenceId"
              label={t('sharedGeofences')}
            />
            <LinkField
              endpointAll="/api/notifications"
              endpointLinked={`/api/notifications?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="notificationId"
              titleGetter={(it) => formatNotificationTitle(t, it)}
              label={t('sharedNotifications')}
            />
            {!features.disableDrivers && (
              <LinkField
                endpointAll="/api/drivers"
                endpointLinked={`/api/drivers?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="driverId"
                titleGetter={(it) => `${it.name} (${it.uniqueId})`}
                label={t('sharedDrivers')}
              />
            )}
            {!features.disableComputedAttributes && (
              <LinkField
                endpointAll="/api/attributes/computed"
                endpointLinked={`/api/attributes/computed?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="attributeId"
                titleGetter={(it) => it.description}
                label={t('sharedComputedAttributes')}
              />
            )}
            {!features.disableSavedCommands && (
              <LinkField
                endpointAll="/api/commands"
                endpointLinked={`/api/commands?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="commandId"
                titleGetter={(it) => it.description}
                label={t('sharedSavedCommands')}
              />
            )}
            {!features.disableMaintenance && (
              <LinkField
                endpointAll="/api/maintenance"
                endpointLinked={`/api/maintenance?deviceId=${id}`}
                baseId={id}
                keyBase="deviceId"
                keyLink="maintenanceId"
                label={t('sharedMaintenance')}
              />
            )}
          </AccordionDetails>
        </Accordion>

        {device && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Botones Dinámicos (Comandos)</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Asigna comandos guardados a los botones de la tarjeta de estado. Los botones se
                actualizan automáticamente cuando el GPS confirma la acción.
              </Typography>

              {/* Active assignments shown as chips */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {buttonSlots.map(({ key, label, color, Icon }) => {
                  const cmdId = localAttrs[key];
                  if (!cmdId) return null;
                  return (
                    <Chip
                      key={key}
                      icon={<Icon sx={{ color: `${color} !important`, fontSize: '1rem' }} />}
                      label={`${label}: ${getCommandName(cmdId)}`}
                      onDelete={() => handleRemoveSlot(key)}
                      size="small"
                      sx={{
                        backgroundColor: `${color}18`,
                        borderColor: `${color}40`,
                        border: '1px solid',
                        color: 'text.primary',
                        fontWeight: 500,
                        fontSize: '0.78rem',
                        '& .MuiChip-deleteIcon': {
                          color: `${color}90`,
                          '&:hover': { color },
                        },
                      }}
                    />
                  );
                })}
              </Box>

              {/* Dropdowns to assign commands */}
              {buttonSlots.map(({ key, label, color, Icon }) => (
                <FormControl fullWidth size="small" key={key} sx={{ mt: 1 }}>
                  <InputLabel
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Icon sx={{ fontSize: '1rem', color }} />
                    {label}
                  </InputLabel>
                  <Select
                    value={localAttrs[key] || ''}
                    onChange={(e) => handleSlotChange(key, e.target.value)}
                    label={`⬤ ${label}`}
                  >
                    <MenuItem value="">
                      <em>Ninguno</em>
                    </MenuItem>
                    {commands.map((cmd) => (
                      <MenuItem key={cmd.id} value={cmd.id}>
                        {cmd.description || cmd.type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}

              {/* Save button */}
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveAll}
                disabled={!dirty || saving}
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.2,
                  fontWeight: 600,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  background: dirty
                    ? 'linear-gradient(135deg, #2c6fe0 0%, #1a4fad 100%)'
                    : undefined,
                  boxShadow: dirty ? '0 6px 20px rgba(44,111,224,0.3)' : 'none',
                  '&:hover': {
                    background: dirty
                      ? 'linear-gradient(135deg, #1a4fad 0%, #143d8a 100%)'
                      : undefined,
                  },
                }}
              >
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </AccordionDetails>
          </Accordion>
        )}
      </Container>
      <Snackbar
        open={saved}
        onClose={() => setSaved(false)}
        autoHideDuration={2500}
        message="Configuración guardada correctamente"
      />
    </PageLayout>
  );
};

export default DeviceConnectionsPage;
