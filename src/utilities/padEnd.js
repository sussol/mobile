export const padEnd = (text, padding) => {
  let prepend = '';
  for (let i = text.length; i <= padding; i++) prepend += '\t';
  return `${text}${prepend}`;
};
