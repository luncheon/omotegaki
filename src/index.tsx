const setViewport = () =>
  (document.querySelector<HTMLMetaElement>('meta[name="viewport"]')!.content = screen.width < 720 ? 'width=720' : 'width=device-width');
addEventListener('orientationchange', setViewport);
setViewport();

import { mdiFileDownloadOutline, mdiFileUploadOutline, mdiGithub } from '@mdi/js';
import { createSignal, For, onCleanup, onMount, Show } from 'solid-js';
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
  'select-none p-0 w-3em h-3em rounded-full shadow drop-shadow shadow-gray-400 bg-white hover:text-hex-ed514e active:text-hex-ed514e active:bg-hex-fdeded';

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
        file && $.onSelectFile(file);
        e.currentTarget.value = '';
      }}
    />
    <IconAndText icon={$.icon} text={$.text} />
  </label>
);

const Header = () => (
  <header class="flex items-center">
    <a class="text-center no-underline text-inherit" href="/">
      <h1 class="font-size-32px">おもてがき</h1>
      <h2 class="font-size-15px -mt-2 tracking-wider text-hex-ed514e">omotegaki.web.app</h2>
    </a>
    <div class="w-4" />
    <LinkButton icon={mdiGithub} text="GitHub" target="_blank" href="https://github.com/luncheon/omotegaki" />
    <div class="flex-1" />
    <FileButton icon={mdiFileUploadOutline} text="Import" accept=".csv" onSelectFile={(file) => importCsv(file)} />
    <div class="w-2" />
    <Button icon={mdiFileDownloadOutline} text="Export" onClick={() => exportAsCsv()} />
  </header>
);

const PrintView = () => {
  let ref!: HTMLIFrameElement;
  onMount(async () => {
    const pdf = await import('./toPdf.js').then((m) => m.toPdf(document.querySelectorAll('svg.omotegaki-preview')));
    const objectUrl = URL.createObjectURL(pdf.output('blob'));
    ref.src = `viewer.html?file=${objectUrl}`;
    onCleanup(() => URL.revokeObjectURL(objectUrl));
  });
  return <iframe ref={ref} class="border border-hex-ccc bg-white" width="100%" height="100%" />;
};

const Tab = <Value extends string>($: {
  name: string;
  value: Value;
  active?: boolean;
  onActivate: (value: Value) => void;
  children: any;
}) => (
  <label
    class={`w-16 pt-2px pb-1px text-center border-hex-ccc rounded-t ${
      $.active ? 'border-l border-t border-r bg-white' : 'cursor-pointer border-bottom hover:text-hex-ed514e'
    }`}
  >
    <input hidden type="radio" name={$.name} value={$.value} checked={$.active} onChange={() => $.onActivate($.value)} />
    {$.children}
  </label>
);

const App = () => {
  const [getActiveTab, setActiveTab] = createSignal<'edit' | 'print'>('edit');
  return (
    <>
      <Header />
      <div class="h-4" />
      <div class="flex pl-2">
        <Tab name="d41564b1" value="edit" active={getActiveTab() === 'edit'} onActivate={setActiveTab} children="編集" />
        <Tab name="d41564b1" value="print" active={getActiveTab() === 'print'} onActivate={setActiveTab} children="印刷" />
      </div>
      <main class="flex-1">
        <Show when={getActiveTab() === 'print'} children={<PrintView />} />
        <div hidden={getActiveTab() !== 'edit'}>
          <section>
            <AddressList />
          </section>
          <div class="h-4" />
          <section class="grid gap-4 grid-cols-[repeat(auto-fill,300px)]">
            <For each={getAddressees()} fallback={<AddressPreview addresser={getAddresser()} addressee={emptyAddress} />}>
              {(addressee) => <AddressPreview addresser={getAddresser()} addressee={addressee} />}
            </For>
          </section>
          <div class="h-8" />
        </div>
      </main>
    </>
  );
};

document.body.className = 'p-4 bg-yellow-50 flex flex-col';

render(() => <App />, document.body);
