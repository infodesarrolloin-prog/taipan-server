import { Fragment } from 'react';
import { makeStyles } from 'tss-react/mui';
import {
  List,
  ListItemText,
  ListItemIcon,
  Divider,
  ListSubheader,
  ListItemButton,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const useStyles = makeStyles()((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
  item: {
    borderRadius: theme.spacing(1.5),
    margin: theme.spacing(0.5, 0),
    overflow: 'hidden',
  },
  listText: {
    whiteSpace: 'nowrap',
    color: theme.palette.text.primary,
  },
  divider: {
    margin: theme.spacing(1.5, 0),
    borderColor: theme.palette.divider,
  },
  subheader: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: theme.spacing(2, 3, 1),
  },
}));

const SideNav = ({ routes }) => {
  const location = useLocation();
  const { classes } = useStyles();

  return (
    <List disablePadding className={classes.root}>
      {routes.map((route) =>
        route.subheader ? (
          <Fragment key={route.subheader}>
            <Divider className={classes.divider} />
            <ListSubheader className={classes.subheader}>{route.subheader}</ListSubheader>
          </Fragment>
        ) : (
          <ListItemButton
            className={classes.item}
            disableRipple
            component={Link}
            key={route.href}
            to={route.href}
            selected={location.pathname.match(route.match || route.href) !== null}
          >
            <ListItemIcon>{route.icon}</ListItemIcon>
            <ListItemText primary={route.name} classes={{ primary: classes.listText }} />
          </ListItemButton>
        ),
      )}
    </List>
  );
};

export default SideNav;
