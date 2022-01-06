export const formatDate = (date: Date) => Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' }).format(date).replace(/\//g, '-');
