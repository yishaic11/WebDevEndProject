export const getBaseUrl = (): string => {
  const prefix = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const domain = process.env.DOMAIN_BASE || 'localhost';
  const port = process.env.PORT || '3000';
  return `${prefix}://${domain}:${port}/`;
};
