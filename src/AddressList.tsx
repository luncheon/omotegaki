import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { batch, createSignal, onCleanup, onMount } from 'solid-js';
import { AddressModel } from './AddressModel';
import { addressFromPostalCode } from './addressFromPostalCode';

const formatDate = (date: Date) => Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' }).format(date).replace(/\//g, '-');
const deleteControlCharacters = (text: string) => text.replace(/\p{gc=Cc}/gu, (c) => (c === '\n' || c === '\r' || c === '\t' ? c : ''));

export const emptyAddress: AddressModel = Object.freeze({ postalCode: '', address: '', name: '' });
const [getAddresser, setAddresser] = createSignal<AddressModel>(emptyAddress);
const [getAddressees, setAddressees] = createSignal<readonly AddressModel[]>([]);

export { getAddressees, getAddresser };

type RowModel = [boolean, string, string, string];

const rowToAddress = (row: RowModel | undefined): AddressModel =>
  row ? { postalCode: row[1].replace(/[^0-9]/g, ''), address: row[2], name: row[3] } : emptyAddress;

let sheet: ReturnType<typeof jspreadsheet>;

const sync = () => {
  if (!sheet) {
    return;
  }
  const rows = sheet.getData() as RowModel[];
  batch(() => {
    setAddresser(rowToAddress(rows[0]));
    setAddressees(
      rows
        .slice(1)
        .filter((row) => !row[0] && (row[1] || row[2] || row[3]))
        .map(rowToAddress),
    );
  });
  location.hash = '#' + compressToEncodedURIComponent(JSON.stringify(rows));
};

export const exportAsCsv = () => sheet?.download(true);
export const importCsv = async (csvFile: File) => {
  const csvString = await csvFile.text();
  // jspreadsheet-ce@4.13.3 では parseCSV の型が間違っています。
  // 修正 PR: https://github.com/jspreadsheet/ce/pull/1626
  const rows = sheet?.parseCSV(csvString as any)?.slice(1) as undefined | RowModel[];
  if (rows) {
    sheet.setData(rows);
    sync();
  }
};

export const AddressList = () => {
  let element: HTMLDivElement;
  onMount(() => {
    const rows: Record<string | number, { title: string }> = new Proxy(
      {},
      { get: (_, p) => ({ title: p === '0' ? '差出人' : `宛先${p as string}` }) },
    );
    sheet = jspreadsheet(element, {
      csvFileName: `omotegaki-${formatDate(new Date())}`,
      about: false,
      allowRenameColumn: false,
      allowInsertColumn: false,
      allowDeleteColumn: false,
      autoIncrement: false,
      minDimensions: [3, 5],
      rows,
      columns: [
        { title: '無効', type: 'checkbox', width: 50 },
        { title: '郵便番号', width: 90 },
        { title: '住所', width: 320, align: 'left', wordWrap: true },
        { title: '名前', width: 140, align: 'right', wordWrap: true },
        { title: '備考', width: 9999, align: 'left', wordWrap: true },
      ],
      onchange: async (_element, _cell, colIndex, rowIndex, newValue, _oldValue) => {
        if (colIndex === '1') {
          const address = await addressFromPostalCode(newValue as string);
          address && sheet.setValueFromCoords(2, +rowIndex, address);
        }
      },
      onbeforechange: (_element, _cell, _columnIndex, _rowIndex, value) => {
        if (typeof value === 'string') {
          value = deleteControlCharacters(value);
          return value.trim() === '' ? '' : value;
        }
      },
      onafterchanges: sync,
      onundo: sync,
      onredo: sync,
      ondeleterow: (_element, startRowIndex) => {
        for (let i = startRowIndex; i < sheet.rows.length; i++) {
          const node = sheet.rows[i]?.children[0];
          node && (node.innerHTML = rows[i]!.title);
        }
        sync();
      },
    });

    try {
      const s = decompressFromEncodedURIComponent(location.hash.slice(1));
      if (s) {
        const rows = JSON.parse(s);
        if (Array.isArray(rows) && rows.every((row) => Array.isArray(row))) {
          sheet.setData(rows);
          sync();
        }
      }
    } catch (error) {
      console.warn(error);
    }

    onCleanup(() => sheet.destroy());
  });
  return <div ref={element!} />;
};
