export const emptyForm = { name: '', email: '', message: '', website: '' };
const length = (value) => [...value].length;
export function normalizeContact(data) {
  return { name: data.name.trim().replace(/\s+/g, ' '), email: data.email.trim().toLowerCase(), message: data.message.trim(), website: data.website.trim() };
}
export function validateContact(data) {
  const fields = {};
  if (length(data.name) < 2 || length(data.name) > 80 || /[<>\r\n]/.test(data.name)) fields.name = 'Use a name between 2 and 80 characters, without angle brackets.';
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) || length(data.email) > 160) fields.email = 'Enter a valid email address (up to 160 characters).';
  if (length(data.message) < 10 || length(data.message) > 3000) fields.message = 'Write a message between 10 and 3000 characters.';
  return fields;
}
