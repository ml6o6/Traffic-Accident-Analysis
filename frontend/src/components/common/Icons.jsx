// Компоненты для отображения иконок,svg-элементы с пропсами
export const IconLogout = (props) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const IconEdit = (props) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const IconTrash = (props) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const IconPlus = (props) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
