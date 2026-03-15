export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateVault = (data) => {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (data.name?.trim().length > 50) errors.name = 'Name must be 50 characters or less';
  if (data.description?.length > 200) errors.description = 'Description must be 200 characters or less';
  return errors;
};

export const validateResource = (data) => {
  const errors = {};
  if (data.type === 'snippet') {
    if (!data.title?.trim()) errors.title = 'Title is required for snippets';
    if (!data.snippet?.code?.trim()) errors.code = 'Code is required for snippets';
    if (!data.snippet?.language) errors.language = 'Language is required for snippets';
  } else {
    if (!data.url?.trim()) errors.url = 'URL is required';
    else if (!isValidUrl(data.url)) errors.url = 'Invalid URL format';
  }
  if (!data.vault) errors.vault = 'Vault is required';
  return errors;
};
