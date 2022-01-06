import { mdiFileDownloadOutline, mdiFileUploadOutline, mdiPrinterOutline } from '@mdi/js';
import { jsPDF } from 'jspdf';
import { For } from 'solid-js';
import { render } from 'solid-js/web';
import 'svg2pdf.js';
import { AddressList, exportAsCsv, getAddressees, getAddresser, importCsv } from './AddressList';
import { AddressPreview } from './AddressPreview';
import './genjyuugothic-20150607/jspdf-GenJyuuGothic-Regular-normal.js';
import './index.css';
import { formatDate } from './util';

const downloadPdf = async (svgs: Iterable<SVGSVGElement>) => {
  const doc = new jsPDF({ putOnlyUsedFonts: true, unit: 'mm', format: [100, 148] });
  doc.setFont('GenJyuuGothic-Regular', 'normal');

  // svg2pdf.js による setFont() を無視します。
  doc.setFont = () => doc;

  let first = true;
  for (const svg of svgs) {
    first ? (first = false) : doc.addPage();
    await doc.svg(svg);
  }
  await doc.save(`omotegaki-${formatDate(new Date())}.pdf`, {
    returnPromise: true,
  });
};

const Icon = ({ icon, size }: { icon: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size ?? 24} height={size ?? 24} vertical-align="middle">
    <path fill="currentColor" d={icon} />
  </svg>
);

const Button = ($: { icon: string; text: string; onClick: () => void }) => (
  <button
    type="button"
    class="flex flex-col items-center justify-center w-3em h-3em rounded-full border border-gray-400 bg-white hover:text-blue-500"
    onClick={$.onClick}
  >
    <Icon icon={$.icon} size={20} />
    <span style="font-size: 10px">{$.text}</span>
  </button>
);

const FileButton = ($: { icon: string; text: string; onSelectFile: (file: File) => void }) => (
  <label class="cursor-pointer flex flex-col items-center justify-center w-3em h-3em rounded-full border border-gray-400 bg-white hover:text-blue-500">
    <input
      hidden
      type="file"
      onChange={(e) => {
        const file = e.currentTarget.files?.[0];
        if (file) {
          $.onSelectFile(file);
        }
        e.currentTarget.value = '';
      }}
    />
    <Icon icon={$.icon} size={20} />
    <span style="font-size: 10px">{$.text}</span>
  </label>
);

const App = () => (
  <>
    <header class="flex items-center">
      <h1 class="flex-1">omotegaki</h1>
      <FileButton icon={mdiFileUploadOutline} text="Import" onSelectFile={(file) => importCsv(file)} />
      <div class="w-1" />
      <Button icon={mdiFileDownloadOutline} text="Export" onClick={() => exportAsCsv()} />
      <div class="w-8" />
      <Button icon={mdiPrinterOutline} text="PDF" onClick={() => downloadPdf(document.querySelectorAll('svg.omotegaki-preview'))} />
    </header>
    <div class="h-4" />
    <main>
      <section>
        <AddressList />
      </section>
      <div class="h-4" />
      <section class="grid gap-4" style="grid-template-columns:repeat(auto-fill,100mm)">
        <For each={getAddressees()}>{(addressee) => <AddressPreview addresser={getAddresser()} addressee={addressee} />}</For>
      </section>
    </main>
  </>
);

document.body.className = 'p-4 bg-yellow-50';

render(() => <App />, document.body);
