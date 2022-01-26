PDFViewerApplicationOptions.set('defaultUrl', '');

addEventListener('DOMContentLoaded', () => {
  for (const [id, visible] of [
    ['presentationMode', false],
    ['openFile', false],
    ['print', true],
    ['download', true],
    ['secondaryToolbarToggle', false],
  ]) {
    const element = document.getElementById(id);
    element.hidden = !visible;
    visible && element.classList.remove('hiddenMediumView');
  }
});
