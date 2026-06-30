'use client';

/**
 * Skip link component for keyboard navigation accessibility
 * Allows users to skip to main content
 */
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
  return (
    <a 
      href={href}
      className="skip-link"
      onFocus={(e) => {
        // Ensure the target element exists and is focusable
        const target = document.querySelector(href);
        if (target && !target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
      }}
    >
      {children}
    </a>
  );
}