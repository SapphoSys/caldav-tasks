export const generateUUID = () => {
  return crypto.randomUUID();
};

/**
 * Check if there are any open modal elements in the DOM
 */
export const hasOpenModalElements = () => {
  const fixedInsetElements = document.querySelectorAll('.fixed.inset-0');
  return Array.from(fixedInsetElements).some((el) => {
    const classList = el.classList;
    return (
      classList.contains('z-50') || classList.contains('z-[60]') || classList.contains('z-[70]')
    );
  });
};
