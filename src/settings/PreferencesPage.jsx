import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Autocomplete,
  TextField,
  createFilterOptions,
  Button,
  Switch,
  useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CachedIcon from '@mui/icons-material/Cached';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  useTranslation,
  useTranslationKeys,
  useLocalization,
} from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import useMapStyles from '../map/core/useMapStyles';
import useMapOverlays from '../map/overlay/useMapOverlays';
import { useAttributePreference } from '../common/util/preferences';
import { useCatch } from '../reactHelper';
import { sessionActions } from '../store';
import { useAdministrator, useRestriction } from '../common/util/permissions';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { nativePostMessage } from '../common/components/NativeInterface';

const deviceFields = [
  { id: 'name', name: 'sharedName' },
  { id: 'uniqueId', name: 'deviceIdentifier' },
  { id: 'phone', name: 'sharedPhone' },
  { id: 'model', name: 'deviceModel' },
  { id: 'contact', name: 'deviceContact' },
  { id: 'geofenceIds', name: 'sharedGeofence' },
  { id: 'driverUniqueId', name: 'sharedDriver' },
  { id: 'motion', name: 'positionMotion' },
];

const PreferencesPage = () => {
  const { classes } = useSettingsStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();

  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const user = useSelector((state) => state.session.user);
  const [attributes, setAttributes] = useState(user.attributes);

  const versionApp = import.meta.env.VITE_APP_VERSION;
  const versionServer = useSelector((state) => state.session.server.version);
  const socket = useSelector((state) => state.session.socket);

  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(() =>
    dayjs().add(1, 'week').locale('en').format('YYYY-MM-DD'),
  );

  const mapStyles = useMapStyles();
  const mapOverlays = useMapOverlays();

  const effectiveDarkMode = useAttributePreference('darkMode');
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { languages, language, setLocalLanguage } = useLocalization();

  const languageList = useMemo(
    () =>
      Object.entries(languages).map(([code, info]) => ({
        code,
        name: info.name,
        country: info.country,
      })),
    [languages],
  );

  const currentLanguageCode = attributes.language || language;
  const selectedLanguage = languageList.find((item) => item.code === currentLanguageCode) || {
    code: currentLanguageCode,
    name: languages[currentLanguageCode]?.name || currentLanguageCode,
  };

  const positionAttributes = usePositionAttributes(t);

  const filter = createFilterOptions();

  const generateToken = useCatch(async () => {
    const expiration = dayjs(tokenExpiration, 'YYYY-MM-DD').toISOString();
    const response = await fetchOrThrow('/api/session/token', {
      method: 'POST',
      body: new URLSearchParams(`expiration=${expiration}`),
    });
    setToken(await response.text());
  });

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const handleSave = useCatch(async () => {
    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes }),
    });
    dispatch(sessionActions.updateUser(await response.json()));
    navigate(-1);
  });

  const handleLogout = useCatch(async () => {
    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(',')
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  });

  const handleReboot = useCatch(async () => {
    const response = await fetch('/api/server/reboot', { method: 'POST' });
    throw Error(response.statusText);
  });

  const currentDarkMode = attributes.hasOwnProperty('darkMode')
    ? attributes.darkMode
    : effectiveDarkMode;
  const currentModeLabel =
    currentDarkMode === true ? t('settingsDarkMode') : t('settingsLightMode') || 'Light Mode';
  const lightModeEnabled = currentDarkMode === undefined ? !prefersDarkMode : !currentDarkMode;

  const toggleDarkMode = useCatch(async (event) => {
    const newDarkMode = !event.target.checked;
    const updatedAttributes = { ...attributes, darkMode: newDarkMode };
    setAttributes(updatedAttributes);

    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes: updatedAttributes }),
    });

    dispatch(sessionActions.updateUser(await response.json()));
  });

  const changeLanguage = useCatch(async (_, value) => {
    const selectedCode = value?.code;
    if (!selectedCode || selectedCode === currentLanguageCode) {
      return;
    }

    const updatedAttributes = { ...attributes, language: selectedCode };
    setAttributes(updatedAttributes);
    setLocalLanguage(selectedCode);

    const response = await fetchOrThrow(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, attributes: updatedAttributes }),
    });

    dispatch(sessionActions.updateUser(await response.json()));
  });

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedPreferences']}>
      <Container maxWidth="xs" className={classes.container}>
        {!readonly && (
          <>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('mapTitle')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <FormControl>
                  <InputLabel>{t('mapActive')}</InputLabel>
                  <Select
                    label={t('mapActive')}
                    value={
                      attributes.activeMapStyles?.split(',') || [
                        'locationIqStreets',
                        'locationIqDark',
                        'openFreeMap',
                      ]
                    }
                    onChange={(e, child) => {
                      const clicked = mapStyles.find((s) => s.id === child.props.value);
                      if (clicked.available) {
                        setAttributes({ ...attributes, activeMapStyles: e.target.value.join(',') });
                      } else if (clicked.id !== 'custom') {
                        const query = new URLSearchParams({ attribute: clicked.attribute });
                        navigate(`/settings/user/${user.id}?${query.toString()}`);
                      }
                    }}
                    multiple
                  >
                    {mapStyles.map((style) => (
                      <MenuItem key={style.id} value={style.id}>
                        <Typography
                          component="span"
                          color={style.available ? 'textPrimary' : 'error'}
                        >
                          {style.title}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>{t('mapOverlay')}</InputLabel>
                  <Select
                    label={t('mapOverlay')}
                    value={attributes.selectedMapOverlay || ''}
                    onChange={(e) => {
                      const clicked = mapOverlays.find((o) => o.id === e.target.value);
                      if (!clicked || clicked.available) {
                        setAttributes({ ...attributes, selectedMapOverlay: e.target.value });
                      } else if (clicked.id !== 'custom') {
                        const query = new URLSearchParams({ attribute: clicked.attribute });
                        navigate(`/settings/user/${user.id}?${query.toString()}`);
                      }
                    }}
                  >
                    <MenuItem value="">{'\u00a0'}</MenuItem>
                    {mapOverlays.map((overlay) => (
                      <MenuItem key={overlay.id} value={overlay.id}>
                        <Typography
                          component="span"
                          color={overlay.available ? 'textPrimary' : 'error'}
                        >
                          {overlay.title}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Autocomplete
                  multiple
                  freeSolo
                  options={Object.keys(positionAttributes)}
                  getOptionLabel={(option) => {
                    if (typeof option === 'object' && option.inputValue) {
                      return option.inputValue;
                    }
                    return positionAttributes[option]?.name || option;
                  }}
                  value={
                    attributes.positionItems?.split(',') || [
                      'fixTime',
                      'address',
                      'speed',
                      'totalDistance',
                    ]
                  }
                  onChange={(_, newValue) => {
                    setAttributes({
                      ...attributes,
                      positionItems: newValue
                        .map((x) => (typeof x === 'string' ? x : x.inputValue))
                        .join(','),
                    });
                  }}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    if (params.inputValue && !options.includes(params.inputValue)) {
                      filtered.push({
                        inputValue: params.inputValue,
                        name: `${t('sharedAdd')} "${params.inputValue}"`,
                      });
                    }
                    return filtered;
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      {option.name ? option.name : positionAttributes[option]?.name || option}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label={t('attributePopupInfo')} />
                  )}
                />
                <FormControl>
                  <InputLabel>{t('mapLiveRoutes')}</InputLabel>
                  <Select
                    label={t('mapLiveRoutes')}
                    value={attributes.mapLiveRoutes || 'none'}
                    onChange={(e) =>
                      setAttributes({ ...attributes, mapLiveRoutes: e.target.value })
                    }
                  >
                    <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                    <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                    <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>{t('mapDirection')}</InputLabel>
                  <Select
                    label={t('mapDirection')}
                    value={attributes.mapDirection || 'selected'}
                    onChange={(e) => setAttributes({ ...attributes, mapDirection: e.target.value })}
                  >
                    <MenuItem value="none">{t('sharedDisabled')}</MenuItem>
                    <MenuItem value="selected">{t('deviceSelected')}</MenuItem>
                    <MenuItem value="all">{t('notificationAlways')}</MenuItem>
                  </Select>
                </FormControl>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapGeofences') ? attributes.mapGeofences : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapGeofences: e.target.checked })
                        }
                      />
                    }
                    label={t('attributeShowGeofences')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapFollow') ? attributes.mapFollow : false
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapFollow: e.target.checked })
                        }
                      />
                    }
                    label={t('deviceFollow')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapCluster') ? attributes.mapCluster : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapCluster: e.target.checked })
                        }
                      />
                    }
                    label={t('mapClustering')}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          attributes.hasOwnProperty('mapOnSelect') ? attributes.mapOnSelect : true
                        }
                        onChange={(e) =>
                          setAttributes({ ...attributes, mapOnSelect: e.target.checked })
                        }
                      />
                    }
                    label={t('mapOnSelect')}
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('deviceTitle')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <SelectField
                  value={attributes.devicePrimary || 'name'}
                  onChange={(e) => setAttributes({ ...attributes, devicePrimary: e.target.value })}
                  data={deviceFields}
                  titleGetter={(it) => t(it.name)}
                  label={t('devicePrimaryInfo')}
                />
                <SelectField
                  value={attributes.deviceSecondary}
                  onChange={(e) =>
                    setAttributes({ ...attributes, deviceSecondary: e.target.value })
                  }
                  data={deviceFields}
                  titleGetter={(it) => t(it.name)}
                  label={t('deviceSecondaryInfo')}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('sharedSound')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <SelectField
                  multiple
                  value={attributes.soundEvents?.split(',') || []}
                  onChange={(e) =>
                    setAttributes({ ...attributes, soundEvents: e.target.value.join(',') })
                  }
                  endpoint="/api/notifications/types"
                  keyGetter={(it) => it.type}
                  titleGetter={(it) => t(prefixString('event', it.type))}
                  label={t('eventsSoundEvents')}
                />
                <SelectField
                  multiple
                  value={attributes.soundAlarms?.split(',') || ['sos']}
                  onChange={(e) =>
                    setAttributes({ ...attributes, soundAlarms: e.target.value.join(',') })
                  }
                  data={alarms}
                  keyGetter={(it) => it.key}
                  label={t('eventsSoundAlarms')}
                />
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">{t('userToken')}</Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <TextField
              label={t('userExpirationTime')}
              type="date"
              value={tokenExpiration}
              onChange={(e) => {
                setTokenExpiration(e.target.value);
                setToken(null);
              }}
            />
            <FormControl>
              <OutlinedInput
                multiline
                rows={6}
                readOnly
                type="text"
                value={token || ''}
                endAdornment={
                  <InputAdornment position="end">
                    <div className={classes.verticalActions}>
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={generateToken}
                        disabled={!!token}
                      >
                        <CachedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => navigator.clipboard.writeText(token)}
                        disabled={!token}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </InputAdornment>
                }
              />
            </FormControl>
          </AccordionDetails>
        </Accordion>
        {!readonly && (
          <>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('sharedInfoTitle')}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <TextField value={versionApp} label={t('settingsAppVersion')} disabled />
                <TextField
                  value={versionServer || '-'}
                  label={t('settingsServerVersion')}
                  disabled
                />
                <TextField
                  value={socket ? t('deviceStatusOnline') : t('deviceStatusOffline')}
                  label={t('settingsConnection')}
                  disabled
                />
                <Button variant="outlined" color="primary" onClick={() => navigate('/emulator')}>
                  {t('sharedEmulator')}
                </Button>
                {admin && (
                  <Button variant="outlined" color="error" onClick={handleReboot}>
                    {t('serverReboot')}
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {t('settingsThemeMode') || 'User interface'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <FormControlLabel
                  control={
                    <Switch checked={lightModeEnabled} onChange={toggleDarkMode} color="primary" />
                  }
                  label={currentModeLabel}
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{t('loginLanguage') || 'Language'}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <Autocomplete
                  size="small"
                  options={languageList}
                  getOptionLabel={(option) => `${option.name} (${option.code})`}
                  value={selectedLanguage}
                  onChange={changeLanguage}
                  isOptionEqualToValue={(option, value) => option.code === value.code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('loginLanguage') || 'Language'}
                      placeholder={t('loginLanguage') || 'Search language'}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      {option.name} ({option.code})
                    </li>
                  )}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">{'Accessibility'}</Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!attributes.accessibilityLargeText}
                      onChange={(e) =>
                        setAttributes({ ...attributes, accessibilityLargeText: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label="Large text"
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!attributes.accessibilityHighContrast}
                      onChange={(e) =>
                        setAttributes({
                          ...attributes,
                          accessibilityHighContrast: e.target.checked,
                        })
                      }
                      color="primary"
                    />
                  }
                  label="High contrast"
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!attributes.accessibilityReduceMotion}
                      onChange={(e) =>
                        setAttributes({
                          ...attributes,
                          accessibilityReduceMotion: e.target.checked,
                        })
                      }
                      color="primary"
                    />
                  }
                  label="Reduce motion"
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!attributes.accessibilityLargeTouchTargets}
                      onChange={(e) =>
                        setAttributes({
                          ...attributes,
                          accessibilityLargeTouchTargets: e.target.checked,
                        })
                      }
                      color="primary"
                    />
                  }
                  label="Larger touch targets"
                  labelPlacement="start"
                  sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
                />
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={false} onClick={handleLogout} sx={{ cursor: 'pointer' }}>
              <AccordionSummary>
                <Typography variant="subtitle1" color="error" sx={{ fontWeight: 600 }}>
                  {t('loginLogout') || 'Cerrar Sesión'}
                </Typography>
              </AccordionSummary>
            </Accordion>
            <div className={classes.buttons}>
              <Button type="button" color="primary" variant="outlined" onClick={() => navigate(-1)}>
                {t('sharedCancel')}
              </Button>
              <Button type="button" color="primary" variant="contained" onClick={handleSave}>
                {t('sharedSave')}
              </Button>
            </div>
          </>
        )}
      </Container>
    </PageLayout>
  );
};

export default PreferencesPage;
