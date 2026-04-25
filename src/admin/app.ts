import type { StrapiApp } from '@strapi/strapi/admin';

function getImageFromClipboard(event: ClipboardEvent): File | null {
  const items = Array.from(event.clipboardData?.items ?? []);
  const imageItem = items.find((item) => item.type.startsWith('image/'));
  return imageItem?.getAsFile() ?? null;
}

function injectFileIntoInput(file: File, input: HTMLInputElement): void {
  const dt = new DataTransfer();
  dt.items.add(file);

  // El setter nativo bypasea la restricción read-only que React impone sobre .files
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'files')?.set;
  if (!nativeSetter) return;

  nativeSetter.call(input, dt.files);

  // React 17+ delega eventos al root del árbol; un change con bubbles lo captura correctamente
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function handlePaste(event: ClipboardEvent): void {
  // Solo actuar si hay un dialog de Strapi abierto (modal del selector de media)
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  if (!dialog) return;

  // El input existe solo cuando el modal está en la vista de "Upload", no en "Browse"
  const fileInput = dialog.querySelector<HTMLInputElement>('input[type="file"]');
  if (!fileInput) return;

  const image = getImageFromClipboard(event);
  if (!image) return;

  event.preventDefault();
  injectFileIntoInput(image, fileInput);
}

export default {
  config: {
    locales: [
      'es',
      'en',
    ],
  },
  bootstrap(_app: StrapiApp) {
    console.log('[Admin] Bootstrap complete. Theme preview panel available at /preview/theme on frontend.');
    document.addEventListener('paste', handlePaste);
  },
};
