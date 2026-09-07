const paths = {
  arrow: 'M5 12h14M13 5l7 7-7 7',
  mail: 'M4 6h16v12H4z M4 7l8 6 8-6',
  external: 'M7 17L17 7M8 7h9v9',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  download: 'M12 3v12M7 10l5 5 5-5M4 16v5h16v-5',
  copy: 'M8 8h12v13H8zM4 16H2V2h12v2',
  up: 'M5 12l7-7 7 7M12 5v15',
  code: 'M8 5l-6 7 6 7M16 5l6 7-6 7M14 3l-4 18',
};

export default function Icon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="icon"><path d={paths[name] || paths.external} /></svg>;
}
