import { mdiFileDownloadOutline, mdiFileUploadOutline, mdiPrinterOutline } from '@mdi/js';
import { For } from 'solid-js';
import { render } from 'solid-js/web';
import { AddressList, emptyAddress, exportAsCsv, getAddressees, getAddresser, importCsv } from './AddressList';
import { AddressPreview } from './AddressPreview';
import './index.css';

const Icon = ({ icon, size }: { icon: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size ?? 24} height={size ?? 24} vertical-align="middle">
    <path fill="currentColor" d={icon} />
  </svg>
);

const cssButton = 'flex flex-col items-center justify-center w-3em h-3em rounded-full border border-gray-400 bg-white hover:text-blue-500';

const Button = ($: { icon: string; text: string; onClick: () => void }) => (
  <button type="button" class={cssButton} onClick={$.onClick}>
    <Icon icon={$.icon} size={20} />
    <span class="font-size-10px">{$.text}</span>
  </button>
);

const FileButton = ($: { icon: string; text: string; accept: string; onSelectFile: (file: File) => void }) => (
  <label class={`cursor-pointer ${cssButton}`}>
    <input
      hidden
      type="file"
      accept={$.accept}
      onChange={(e) => {
        const file = e.currentTarget.files?.[0];
        if (file) {
          $.onSelectFile(file);
        }
        e.currentTarget.value = '';
      }}
    />
    <Icon icon={$.icon} size={20} />
    <span class="font-size-10px">{$.text}</span>
  </label>
);

const App = () => (
  <>
    <header class="flex items-center">
      <h1 class="flex-1">omotegaki.web.app</h1>
      <FileButton icon={mdiFileUploadOutline} text="Import" accept=".csv" onSelectFile={(file) => importCsv(file)} />
      <div class="w-1" />
      <Button icon={mdiFileDownloadOutline} text="Export" onClick={() => exportAsCsv()} />
      <div class="w-8" />
      <Button
        icon={mdiPrinterOutline}
        text="PDF"
        onClick={() => import('./downloadPdf.js').then((m) => m.downloadPdf(document.querySelectorAll('svg.omotegaki-preview')))}
      />
    </header>
    <div class="h-4" />
    <main>
      <section>
        <AddressList />
      </section>
      <div class="h-4" />
      <section class="grid gap-4 grid-cols-[repeat(auto-fill,100mm)]">
        <For each={getAddressees()} fallback={<AddressPreview addresser={getAddresser()} addressee={emptyAddress} />}>
          {(addressee) => <AddressPreview addresser={getAddresser()} addressee={addressee} />}
        </For>
      </section>
    </main>
  </>
);

document.body.className = 'p-4 bg-yellow-50';

render(() => <App />, document.body);
