import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Typography,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import SettingsIcon from '@mui/icons-material/Settings';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import ListIcon from '@mui/icons-material/List';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { sessionActions, devicesActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';

const BottomMenu = () => {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);

  const [anchorEl, setAnchorEl] = useState(null);

  const devicesOpenState = useSelector((state) => state.devices.devicesOpen);
  const devicesOpen = devicesOpenState !== null ? devicesOpenState : desktop;

  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user?.id}`) {
      return 'account';
    }
    if (
      location.pathname.startsWith('/settings') &&
      location.pathname !== '/settings/preferences'
    ) {
      return 'settings';
    }
    if (location.pathname === '/') {
      return devicesOpen ? 'list' : 'map';
    }
    return null;
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };

  const handleLogout = async () => {
    setAnchorEl(null);

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
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'list':
        dispatch(devicesActions.setDevicesOpen(true));
        if (location.pathname !== '/') {
          navigate('/');
        }
        break;
      case 'map':
        dispatch(devicesActions.setDevicesOpen(false));
        if (location.pathname !== '/') {
          navigate('/');
        }
        break;
      case 'settings':
        navigate('/settings/preferences?menu=true');
        break;
      case 'account':
        setAnchorEl(event.currentTarget);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <Paper
      square={false}
      elevation={3}
      sx={{
        borderRadius: '16px',
        backdropFilter: 'blur(18px)',
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.88)' : 'rgba(245,248,255,0.88)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 20px 60px rgba(0,0,0,0.36)'
            : '0 20px 60px rgba(30,60,120,0.12)',
        overflow: 'hidden',
        padding: '4px',
      }}
    >
      <BottomNavigation
        value={currentSelection()}
        onChange={handleSelection}
        showLabels={true}
        sx={{
          backgroundColor: 'transparent',
          border: 'none',
          borderTop: 'none',
          boxShadow: 'none',
          backdropFilter: 'none',
          minHeight: desktop ? 56 : 60,
          height: desktop ? 56 : 60,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            flex: 1,
            height: '100%',
            padding: 0,
            margin: '2px',
            borderRadius: theme.spacing(1.5),
            color: theme.palette.text.secondary,
            transition: theme.transitions.create(['background-color', 'color', 'border-radius'], {
              duration: theme.transitions.duration.shorter,
            }),
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(44,111,224,0.06)',
              borderRadius: theme.spacing(1.5),
            },
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(93,155,255,0.15)' : 'rgba(44,111,224,0.12)',
              borderRadius: theme.spacing(1.5),
            },
          },
          '& .MuiBottomNavigationAction-root .MuiSvgIcon-root': {
            fontSize: '1.4rem',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            marginTop: '2px',
            '&.Mui-selected': {
              fontSize: '0.75rem',
            },
          },
        }}
      >
        <BottomNavigationAction
          label={t('sharedShowList') || 'Lista'}
          icon={<ListIcon />}
          value="list"
          aria-label={t('sharedShowList') || 'Lista'}
        />
        <BottomNavigationAction
          label={t('mapTitle') || 'Mapa'}
          icon={
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          }
          value="map"
          aria-label={t('mapTitle') || 'Mapa'}
        />
        {!readonly && (
          <BottomNavigationAction
            label={t('settingsTitle') || 'Ajustes'}
            icon={<SettingsIcon />}
            value="settings"
            aria-label={t('settingsTitle') || 'Ajustes'}
          />
        )}
        {readonly ? (
          <BottomNavigationAction
            label={t('loginLogout') || 'Salir'}
            icon={<ExitToAppIcon />}
            value="logout"
            aria-label={t('loginLogout') || 'Salir'}
          />
        ) : (
          <BottomNavigationAction
            label={t('settingsUser') || 'Perfil'}
            icon={<PersonIcon />}
            value="account"
            aria-label={t('settingsUser') || 'Perfil'}
          />
        )}
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleAccount}>
          <Typography color="textPrimary">{t('settingsUser') || 'Perfil'}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t('loginLogout') || 'Cerrar Sesión'}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BottomMenu;
