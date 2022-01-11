import { For } from 'solid-js';
import { AddressModel } from './AddressModel';

const addresserPostalCodePosition = { y: 122.5, w: 4, h: 6.5, xs: [5.2, 9.2, 13.2, 18.2, 22.2, 26.2, 30.2] } as const;
const addresseePostalCodePosition = { y: 12, w: 6.2, h: 8.6, xs: [44, 51, 58, 65.3, 72.2, 79.1, 86] } as const;

const calculateAddresserPosition = (addressee: AddressModel) => {
  const { y: bottom, w } = addresserPostalCodePosition;
  const nameLines = addressee.name.split('\n');
  const nameFontSize = 5;
  const nameLineHeight = nameFontSize * (1.6 - 0.1 * nameLines.length);
  const nameY = bottom + nameFontSize - nameLineHeight * nameLines.length;

  const addressLines = addressee.address.split('\n');
  const addressFontSize = 4;
  const addressLineHeight = addressFontSize * 1.4;
  const addressY = nameY + addressFontSize - addressLineHeight * addressLines.length - /* margin */ 6;
  return {
    address: { lines: addressLines, y: addressY, fontSize: addressFontSize, lineHeight: addressLineHeight },
    name: { lines: nameLines, y: nameY, fontSize: nameFontSize, lineHeight: nameLineHeight },
    postalCode: { y: addresserPostalCodePosition.y + 1 + 3.5, fontSize: 3.5, xs: addresserPostalCodePosition.xs.map((x) => x + w / 2) },
  };
};

const calculateAddresseePosition = (addressee: AddressModel) => {
  const { w } = addresseePostalCodePosition;
  const nameLines = addressee.name.split('\n');
  const nameFontSize = 9 - Math.ceil(nameLines.length / 2);
  const nameLineHeight = nameFontSize * 1.4;
  const nameY = 60 + nameFontSize - (nameLineHeight * nameLines.length) / 2;

  const addressLines = addressee.address.split('\n');
  const addressFontSize = Math.min(4.5, nameFontSize * 0.75);
  const addressLineHeight = addressFontSize * 1.4;
  const addressY = nameY + addressFontSize - addressLineHeight * addressLines.length - /* margin */ (16 - nameLines.length * 2);
  return {
    address: { lines: addressLines, y: addressY, fontSize: addressFontSize, lineHeight: addressLineHeight },
    name: { lines: nameLines, y: nameY, fontSize: nameFontSize, lineHeight: nameLineHeight },
    postalCode: { y: addresseePostalCodePosition.y + 1 + 6, fontSize: 6, xs: addresseePostalCodePosition.xs.map((x) => x + w / 2) },
  };
};

const backgroundLineColor = '#ed514e';

const AddresserPostalCodeBackground = () => {
  const { y, w, h, xs } = addresserPostalCodePosition;
  return (
    <g fill="none" stroke={backgroundLineColor} stroke-width={0.25} stroke-dasharray="1.5 1">
      <rect y={y} height={h} x={xs[0]} width={3 * w} />
      <line y1={y} y2={y + h} x1={xs[1]} x2={xs[1]} />
      <line y1={y} y2={y + h} x1={xs[2]} x2={xs[2]} />
      <rect y={y} height={h} x={xs[3]} width={4 * w} />
      <line y1={y} y2={y + h} x1={xs[4]} x2={xs[4]} />
      <line y1={y} y2={y + h} x1={xs[5]} x2={xs[5]} />
      <line y1={y} y2={y + h} x1={xs[6]} x2={xs[6]} />
    </g>
  );
};

const AddresseePostalCodeBackground = () => {
  const { y, w, h, xs } = addresseePostalCodePosition;
  return (
    <g fill="none" stroke={backgroundLineColor}>
      <For each={xs}>{(x, i) => <rect x={x} y={y} width={w} height={h} stroke-width={i() < 3 ? 0.375 : 0.25} />}</For>
      <line x1={xs[2] + w} x2={xs[3]} y1={y + h / 2} y2={y + h / 2} stroke-width={0.375} />
    </g>
  );
};

const Addresser = ($: AddressModel) => {
  const { address, name, postalCode } = calculateAddresserPosition($);
  return (
    <>
      <text font-size={`${address.fontSize}px`} text-anchor="end">
        <For each={address.lines}>{(s, i) => <tspan x={90} y={address.y + i() * address.lineHeight} children={s} />}</For>
      </text>
      <text font-size={`${name.fontSize}px`} text-anchor="end">
        <For each={name.lines}>{(s, i) => <tspan x={90} y={name.y + i() * name.lineHeight} children={s} />}</For>
      </text>
      <text font-size={`${postalCode.fontSize}px`} y={postalCode.y} text-anchor="middle">
        <For each={postalCode.xs}>{(x, i) => <tspan x={x} children={$.postalCode[i()]} />}</For>
      </text>
    </>
  );
};

const Addressee = ($: AddressModel) => {
  const { address, name, postalCode } = calculateAddresseePosition($);
  return (
    <>
      <text font-size={`${address.fontSize}px`}>
        <For each={address.lines}>
          {(s, i) => <tspan x={30 + i() * address.fontSize} y={address.y + i() * address.lineHeight} children={s} />}
        </For>
      </text>
      <text font-size={`${name.fontSize}px`} text-anchor="end">
        <For each={name.lines}>{(s, i) => <tspan x={90} y={name.y + i() * name.lineHeight} children={s} />}</For>
      </text>
      <text font-size={`${postalCode.fontSize}px`} y={postalCode.y} text-anchor="middle">
        <For each={postalCode.xs}>{(x, i) => <tspan x={x}>{$.postalCode[i()]}</tspan>}</For>
      </text>
    </>
  );
};

export const AddressPreview = ($: { addresser: AddressModel; addressee: AddressModel }) => (
  <div class="relative bg-white" style="box-shadow: 0 0 2px #0002,1px 1px 4px #0002">
    <svg viewBox="0 0 100 148" width="100mm" height="148mm" class="absolute inset-0">
      <AddresserPostalCodeBackground />
      <AddresseePostalCodeBackground />
    </svg>
    <svg viewBox="0 0 100 148" width="100mm" height="148mm" class="omotegaki-preview">
      <Addresser {...$.addresser} />
      <Addressee {...$.addressee} />
    </svg>
  </div>
);
