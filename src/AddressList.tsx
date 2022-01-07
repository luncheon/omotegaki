import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';
import { batch, createSignal, onCleanup, onMount } from 'solid-js';
import { AddressModel } from './AddressModel';
import { deleteControlCharacters, formatDate } from './util';

const emptyAddress: AddressModel = Object.freeze({ postalCode: '', address: '', name: '' });
const [getAddresser, setAddresser] = createSignal<AddressModel>(emptyAddress);
const [getAddressees, setAddressees] = createSignal<readonly AddressModel[]>([]);

export { getAddresser, getAddressees };

type RowModel = [boolean, string, string, string];

const rowToAddress = (row: RowModel | undefined): AddressModel =>
  row ? { postalCode: row[1].replace(/[^0-9]/g, ''), address: row[2], name: row[3] } : emptyAddress;

let sheet: jspreadsheet.JSpreadsheetElement;

const sync = () => {
  const rows = sheet?.getData() as RowModel[];
  rows &&
    batch(() => {
      setAddresser(rowToAddress(rows[0]));
      setAddressees(rows.filter((row) => !row[0] && (row[1] || row[2] || row[3])).map(rowToAddress));
    });
};

export const exportAsCsv = () => sheet?.download(true);
export const importCsv = async (csvFile: File) => {
  const csvString = await csvFile.text();
  const rows = sheet?.parseCSV(csvString)?.slice(1) as undefined | RowModel[];
  if (rows) {
    sheet.setData(rows);
    sync();
  }
};

export const AddressList = () => {
  let element: HTMLDivElement;
  onMount(() => {
    sheet = jspreadsheet(element, {
      csvFileName: `omotegaki-${formatDate(new Date())}`,
      about: false,
      allowRenameColumn: false,
      allowInsertColumn: false,
      allowDeleteColumn: false,
      autoIncrement: false,
      minDimensions: [3, 10],
      rows: [{ title: '差出人' }],
      columns: [
        { title: '無効', type: 'checkbox', width: 50 },
        { title: '郵便番号', width: 90 },
        { title: '住所', width: 320, align: 'left', wordWrap: true },
        { title: '名前', width: 140, align: 'right', wordWrap: true },
        { title: '備考', width: 9999, align: 'left', wordWrap: true },
      ],
      onbeforechange: (_element, _cell, _columnIndex, _rowIndex, value) => {
        if (typeof value === 'string') {
          value = deleteControlCharacters(value);
          return value.trim() === '' ? '' : value;
        }
      },
      onafterchanges: sync,
      onundo: sync,
    });
    sheet.updateCell(0, 0, true);

    onCleanup(() => sheet.destroy());
  });
  return <div ref={element!} />;
};