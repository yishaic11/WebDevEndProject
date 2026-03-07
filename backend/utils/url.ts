export const getBaseUrl = (): string => {
  const domain = process.env.DOMAIN_BASE || 'localhost';
  const port = process.env.PORT || '3000';
  return `http://${domain}:${port}/`;
};
