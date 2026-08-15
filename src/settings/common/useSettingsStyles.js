import { makeStyles } from 'tss-react/mui';

export default makeStyles()((theme) => ({
  table: {
    marginBottom: theme.spacing(6),
    borderRadius: theme.spacing(1.5),
    overflow: 'hidden',
  },
  columnAction: {
    width: '1%',
    paddingRight: theme.spacing(1),
  },
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(12,18,32,0.96)' : 'rgba(240,244,255,0.96)',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 16px 40px rgba(0,0,0,0.36)'
        : '0 16px 40px rgba(30,60,120,0.10)',
    backdropFilter: 'blur(14px)',
  },
  buttons: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
    '& > *': {
      flex: '1 1 32%',
    },
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(44,111,224,0.04)',
    borderRadius: theme.spacing(1.5),
    border: `1px solid ${theme.palette.divider}`,
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
  },
  verticalActions: {
    display: 'flex',
    flexDirection: 'column',
  },
}));
