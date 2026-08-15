import { useState } from 'react';
import {
  AppBar,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from './LocalizationProvider';
import BackIcon from './BackIcon';

const useStyles = makeStyles()((theme, { miniVariant }) => ({
  root: {
    height: '100%',
    display: 'flex',
    minHeight: '100vh',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
      overflowY: 'auto',
      height: 'auto',
    },
  },
  desktopDrawer: {
    width: miniVariant ? theme.spacing(7) : theme.dimensions.drawerWidthDesktop,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    backgroundColor: 'transparent',
    borderRight: `1px solid ${theme.palette.divider}`,
    ...(miniVariant && {
      '& .MuiListItemButton-root': {
        minHeight: 48,
      },
      '& .MuiListItemText-root': {
        display: 'none',
      },
    }),
    '@media print': {
      display: 'none',
    },
  },
  mobileDrawer: {
    width: '80%',
    maxWidth: '360px',
    height: 'auto',
    maxHeight: '75%',
    top: '50% !important',
    left: '50% !important',
    transform: 'translate(-50%, -50%) !important',
    borderRadius: '20px !important',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.92)' : 'rgba(255,255,255,0.96)',
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 24px 64px rgba(0,0,0,0.36)'
        : '0 16px 48px rgba(30,60,120,0.12)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    overflowY: 'auto',
    padding: theme.spacing(1),
    margin: 0,
    '@media print': {
      display: 'none',
    },
  },
  mobileToolbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1100,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(10,14,24,0.88)' : 'rgba(240,244,255,0.92)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 4px 20px rgba(0,0,0,0.18)'
        : '0 4px 20px rgba(30,60,120,0.08)',
    '@media print': {
      display: 'none',
    },
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    backgroundColor: 'transparent',
    [theme.breakpoints.down('md')]: {
      overflowY: 'visible',
      paddingBottom: theme.spacing(14),
    },
  },
  toolbar: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: 700,
    letterSpacing: '0.01em',
  },
  navToggle: {
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
    },
  },
}));

const PageTitle = ({ breadcrumbs }) => {
  const theme = useTheme();
  const t = useTranslation();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  if (desktop) {
    return (
      <Typography variant="h6" noWrap>
        {t(breadcrumbs[0])}
      </Typography>
    );
  }
  return (
    <Breadcrumbs>
      {breadcrumbs.slice(0, -1).map((breadcrumb) => (
        <Typography variant="h6" color="inherit" key={breadcrumb}>
          {t(breadcrumb)}
        </Typography>
      ))}
      <Typography variant="h6" color="textPrimary">
        {t(breadcrumbs[breadcrumbs.length - 1])}
      </Typography>
    </Breadcrumbs>
  );
};

const PageLayout = ({ menu, breadcrumbs, children }) => {
  const [miniVariant, setMiniVariant] = useState(false);
  const { classes } = useStyles({ miniVariant });
  const theme = useTheme();
  const navigate = useNavigate();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const [searchParams] = useSearchParams();

  const [openDrawer, setOpenDrawer] = useState(!desktop && searchParams.has('menu'));

  const toggleDrawer = () => setMiniVariant(!miniVariant);

  return (
    <div className={classes.root}>
      {desktop ? (
        <Drawer
          variant="permanent"
          className={classes.desktopDrawer}
          slotProps={{ paper: { className: classes.desktopDrawer } }}
        >
          <Toolbar>
            {!miniVariant && (
              <>
                <IconButton
                  color="inherit"
                  edge="start"
                  sx={{ mr: 2 }}
                  onClick={() => navigate('/')}
                >
                  <BackIcon />
                </IconButton>
                <PageTitle breadcrumbs={breadcrumbs} />
              </>
            )}
            <IconButton
              color="inherit"
              edge="start"
              sx={{ ml: miniVariant ? -2 : 'auto' }}
              onClick={toggleDrawer}
            >
              {miniVariant !== (theme.direction === 'rtl') ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </Toolbar>
          <Divider />
          {menu}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          slotProps={{ paper: { className: classes.mobileDrawer } }}
        >
          <div onClick={() => setOpenDrawer(false)} style={{ width: '100%' }}>
            {menu}
          </div>
        </Drawer>
      )}
      {!desktop && (
        <AppBar className={classes.mobileToolbar} position="static" color="inherit" elevation={0}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              sx={{ mr: 2 }}
              onClick={() => setOpenDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <PageTitle breadcrumbs={breadcrumbs} />
          </Toolbar>
        </AppBar>
      )}
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default PageLayout;
