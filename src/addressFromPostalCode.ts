const REGION = [
  '',
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
];

export const addressFromPostalCode = async (postalCode: string) => {
  const firstPart = postalCode.match(/^([0-9]{3})-[0-9]{4}/)?.[1];
  if (!firstPart) {
    return;
  }
  const response = await fetch(`https://yubinbango.github.io/yubinbango-data/data/${firstPart}.js`);
  const text = response.ok && (await response.text());
  const json =
    text &&
    JSON.parse(
      text
        .trim()
        .replace(/^\$yubin\(/, '')
        .replace(/\);?$/, ''),
    );
  const record: [number, string, string] | undefined | false | '' = json && json[postalCode.replace(/-/, '')];
  if (record) {
    return `${REGION[record[0]] || ''}${record.slice(1).join('')}`;
  }
};
