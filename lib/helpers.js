export const formatNumber = n =>
  n.toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
