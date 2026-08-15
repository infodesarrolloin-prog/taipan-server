export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      '@font-face': [
        {
          fontFamily: 'Metropolis',
          fontStyle: 'normal',
          fontWeight: 400,
          fontDisplay: 'swap',
          src: "local('Metropolis'), local('Metropolis-Regular'), local('Inter'), local('Segoe UI')",
        },
        {
          fontFamily: 'Metropolis',
          fontStyle: 'normal',
          fontWeight: 600,
          fontDisplay: 'swap',
          src: "local('Metropolis SemiBold'), local('Metropolis-SemiBold')",
        },
        {
          fontFamily: 'Metropolis',
          fontStyle: 'normal',
          fontWeight: 700,
          fontDisplay: 'swap',
          src: "local('Metropolis Bold'), local('Metropolis-Bold')",
        },
      ],
      html: {
        minHeight: '100%',
        backgroundColor: theme.palette.background.default,
      },
      body: {
        minHeight: '100%',
        margin: 0,
        fontFamily:
          'Metropolis, "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '#root': {
        minHeight: '100%',
      },
      '*': {
        boxSizing: 'border-box',
      },
      '*, *::before, *::after': {
        boxSizing: 'inherit',
      },
      button: { font: 'inherit' },
      input: { font: 'inherit' },
      select: { font: 'inherit' },
      textarea: { font: 'inherit' },
    }),
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.88)' : 'rgba(245,248,255,0.88)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 20px 60px rgba(0,0,0,0.22)'
            : '0 20px 60px rgba(30,60,120,0.10)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        color: theme.palette.text.primary,
        overflow: 'hidden',
      }),
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(8,12,22,0.92)' : 'rgba(235,242,255,0.92)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 10px 30px rgba(0,0,0,0.18)'
            : '0 4px 20px rgba(30,60,120,0.08)',
        color: theme.palette.text.primary,
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(8,12,22,0.98)' : 'rgba(235,242,255,0.98)',
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 20px 45px rgba(0,0,0,0.26)'
            : '0 20px 45px rgba(30,60,120,0.10)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.spacing(1.5),
        margin: theme.spacing(0.5, 0),
        padding: theme.spacing(1.25, 1.5),
        transition: theme.transitions.create(
          ['background-color', 'border-color', 'box-shadow', 'transform'],
          {
            duration: theme.transitions.duration.shorter,
            easing: theme.transitions.easing.easeOut,
          },
        ),
        border: `1px solid transparent`,
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(44,111,224,0.06)',
          borderColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(44,111,224,0.20)',
          boxShadow: '0 12px 26px rgba(14,24,44,0.12)',
          transform: 'translateY(-1px)',
        },
        '&.Mui-selected': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(93,155,255,0.18)' : 'rgba(44,111,224,0.12)',
          borderColor: theme.palette.primary.main,
          boxShadow: '0 14px 36px rgba(30,70,135,0.14)',
        },
        '&.Mui-selected:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(93,155,255,0.24)' : 'rgba(44,111,224,0.18)',
        },
        '&.Mui-focusVisible': {
          outline: `2px solid ${theme.palette.primary.light}`,
          outlineOffset: '3px',
        },
      }),
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: ({ theme }) => ({
        minWidth: 44,
        color: theme.palette.primary.light,
      }),
    },
  },
  MuiListSubheader: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.secondary,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        padding: theme.spacing(2, 3, 1),
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.spacing(1.5),
        textTransform: 'none',
        boxShadow: 'none',
        transition: theme.transitions.create(
          ['background-color', 'box-shadow', 'transform', 'border-color'],
          { duration: theme.transitions.duration.shorter },
        ),
        '&:hover': {
          boxShadow: '0 14px 32px rgba(33,144,255,0.14)',
          transform: 'translateY(-1px)',
        },
        '&:active': { transform: 'scale(0.99)' },
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.light}`,
          outlineOffset: '3px',
        },
      }),
      containedPrimary: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': { backgroundColor: theme.palette.primary.dark },
      }),
      outlined: ({ theme }) => ({
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(44,111,224,0.04)',
          borderColor: theme.palette.primary.light,
        },
      }),
      text: ({ theme }) => ({
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(44,111,224,0.05)',
        },
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(44,111,224,0.04)',
        borderRadius: theme.spacing(1.25),
        border: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(44,111,224,0.06)',
          borderColor: theme.palette.primary.light,
        },
        '&.Mui-focused': {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(93,155,255,0.12)' : 'rgba(44,111,224,0.12)'}`,
        },
      }),
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(44,111,224,0.04)',
        borderRadius: theme.spacing(1.25),
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(44,111,224,0.06)',
        },
        '&.Mui-focused': {
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(44,111,224,0.08)',
        },
      }),
    },
  },
  MuiInputBase: {
    styleOverrides: {
      input: ({ theme }) => ({
        fontFamily: theme.typography.fontFamily,
      }),
    },
  },
  MuiSelect: {
    styleOverrides: {
      icon: ({ theme }) => ({
        color: theme.palette.primary.light,
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(10,14,26,0.96)' : 'rgba(238,244,255,0.96)',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 24px 60px rgba(0,0,0,0.32)'
            : '0 16px 48px rgba(30,60,120,0.14)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
      }),
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: 'rgba(21,29,46,0.96)',
        color: '#F3F7FF',
        fontSize: '0.85rem',
        borderRadius: theme.spacing(1),
        boxShadow: '0 16px 42px rgba(0,0,0,0.24)',
      }),
      arrow: () => ({
        color: 'rgba(21,29,46,0.96)',
      }),
    },
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.spacing(2.5),
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(9,13,24,0.96)' : 'rgba(238,244,255,0.96)',
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 30px 90px rgba(0,0,0,0.36)'
            : '0 20px 60px rgba(30,60,120,0.18)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }),
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(3, 3, 2),
        color: theme.palette.text.primary,
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2.5, 3),
      }),
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2, 3, 3),
      }),
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(44,111,224,0.04)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: `${theme.spacing(1.5)} !important`,
        boxShadow: 'none',
        overflow: 'hidden',
        '& + &': {
          marginTop: theme.spacing(1.5),
        },
        '&::before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      }),
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(0, 2),
        minHeight: 52,
        borderRadius: theme.spacing(1.5),
        '&.Mui-expanded': {
          minHeight: 52,
        },
      }),
      content: ({ theme }) => ({
        margin: theme.spacing(1.5, 0),
        '&.Mui-expanded': {
          margin: theme.spacing(1.5, 0),
        },
      }),
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(2, 3, 3),
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
    },
  },
  MuiBottomNavigation: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: 'rgba(10,14,24,0.96)',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(16px)',
        minHeight: 68,
      }),
    },
  },
  MuiBottomNavigationAction: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.palette.text.secondary,
        minHeight: 64,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: theme.spacing(1),
        transition: theme.transitions.create(['background-color', 'color', 'border-radius'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&.Mui-selected': {
          color: theme.palette.primary.main,
          backgroundColor: 'rgba(93,155,255,0.12)',
          borderRadius: theme.spacing(1.5),
        },
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: theme.spacing(1.5),
        },
      }),
      label: () => ({
        display: 'none',
      }),
      iconOnly: () => ({
        marginTop: 0,
      }),
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.spacing(1),
        margin: theme.spacing(0.5, 0),
        padding: theme.spacing(1, 2),
        transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
          easing: theme.transitions.easing.easeOut,
        }),
        border: `1px solid transparent`,
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(255,255,255,0.14)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(93,155,255,0.16)',
          borderColor: theme.palette.primary.main,
        },
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: () => ({
        minHeight: 48,
      }),
      indicator: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        height: 3,
        borderRadius: 3,
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }) => ({
        textTransform: 'none',
        fontWeight: 600,
        minHeight: 48,
        padding: theme.spacing(1, 2),
      }),
    },
  },
};
