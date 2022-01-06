export const formatDate = (date: Date) => Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' }).format(date).replace(/\//g, '-');

export const deleteControlCharacters = (text: string) =>
  text.replace(/\p{gc=Cc}/gu, (c) => (c === '\n' || c === '\r' || c === '\t' ? c : ''));
