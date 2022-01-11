import { mdiFileDownloadOutline, mdiFileUploadOutline, mdiGithub, mdiPrinterOutline } from '@mdi/js';
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

const IconAndText = ($: { icon: string; text: string }) => (
  <div class="flex flex-col items-center justify-center w-full h-full">
    <Icon icon={$.icon} size={20} />
    <span class="font-size-10px leading-none">{$.text}</span>
  </div>
);

const cssButton =
  'select-none p-0 w-3em h-3em rounded-full shadow drop-shadow shadow-gray-400 bg-white hover:text-blue-500 active:bg-blue-50';

const Button = ($: { icon: string; text: string; onClick: () => void }) => (
  <button class={cssButton} type="button" onClick={$.onClick}>
    <IconAndText icon={$.icon} text={$.text} />
  </button>
);

const LinkButton = ($: { icon: string; text: string; href: string; target?: '_blank' }) => (
  <a class={`no-underline text-current ${cssButton}`} href={$.href} target={$.target}>
    <IconAndText icon={$.icon} text={$.text} />
  </a>
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
    <IconAndText icon={$.icon} text={$.text} />
  </label>
);

const App = () => (
  <>
    <header class="flex items-center">
      <h1>omotegaki.web.app</h1>
      <div class="w-4" />
      <LinkButton icon={mdiGithub} text="GitHub" target="_blank" href="https://github.com/luncheon/omotegaki" />
      <div class="flex-1" />
      <FileButton icon={mdiFileUploadOutline} text="Import" accept=".csv" onSelectFile={(file) => importCsv(file)} />
      <div class="w-2" />
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
      <section class="grid gap-4 grid-cols-[repeat(auto-fill,300px)]">
        <For each={getAddressees()} fallback={<AddressPreview addresser={getAddresser()} addressee={emptyAddress} />}>
          {(addressee) => <AddressPreview addresser={getAddresser()} addressee={addressee} />}
        </For>
      </section>
    </main>
  </>
);

document.body.className = 'p-4 bg-yellow-50';

render(() => <App />, document.body);
