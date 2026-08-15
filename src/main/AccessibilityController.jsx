import { useEffect } from 'react';
import { useAttributePreference } from '../common/util/preferences';

/**
 * AccessibilityController
 *
 * Reads accessibility preferences from user attributes and applies them
 * as CSS custom properties / global styles without affecting any
 * business logic, routes, or functional components.
 */
const AccessibilityController = () => {
  const largeText = useAttributePreference('accessibilityLargeText', false);
  const highContrast = useAttributePreference('accessibilityHighContrast', false);
  const reduceMotion = useAttributePreference('accessibilityReduceMotion', false);
  const largeTouchTargets = useAttributePreference('accessibilityLargeTouchTargets', false);

  // Large text: bump root font-size by 12%
  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.style.fontSize = '112%';
    } else {
      root.style.removeProperty('font-size');
    }
  }, [largeText]);

  // High contrast: add a CSS class to body for outline enhancements
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('a11y-high-contrast');
    } else {
      document.body.classList.remove('a11y-high-contrast');
    }
  }, [highContrast]);

  // Reduce motion: freeze all CSS transitions/animations
  useEffect(() => {
    const id = 'a11y-reduce-motion-style';
    let el = document.getElementById(id);
    if (reduceMotion) {
      if (!el) {
        el = document.createElement('style');
        el.id = id;
        el.textContent = `
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        `;
        document.head.appendChild(el);
      }
    } else if (el) {
      el.remove();
    }
  }, [reduceMotion]);

  // Large touch targets: increase minimum tap area on interactive elements
  useEffect(() => {
    const id = 'a11y-large-touch-style';
    let el = document.getElementById(id);
    if (largeTouchTargets) {
      if (!el) {
        el = document.createElement('style');
        el.id = id;
        el.textContent = `
          .MuiButtonBase-root, .MuiIconButton-root, .MuiListItemButton-root,
          .MuiBottomNavigationAction-root, button, [role="button"] {
            min-height: 52px !important;
            min-width: 52px !important;
          }
          .MuiBottomNavigationAction-root {
            min-width: unset !important;
          }
        `;
        document.head.appendChild(el);
      }
    } else if (el) {
      el.remove();
    }
  }, [largeTouchTargets]);

  // High-contrast CSS (injected once, toggled via class)
  useEffect(() => {
    const id = 'a11y-high-contrast-style';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id;
      el.textContent = `
        body.a11y-high-contrast .MuiPaper-root,
        body.a11y-high-contrast .MuiCard-root {
          outline: 2px solid currentColor;
        }
        body.a11y-high-contrast .MuiButtonBase-root:focus-visible {
          outline: 3px solid #FFD166 !important;
          outline-offset: 3px !important;
        }
        body.a11y-high-contrast {
          filter: contrast(1.15);
        }
      `;
      document.head.appendChild(el);
    }
  }, []);

  return null;
};

export default AccessibilityController;
