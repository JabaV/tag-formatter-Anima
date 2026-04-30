type NullableElement<T extends HTMLElement> = T | null;

type FormatResult = {
  readonly value: string;
  readonly count: number;
};

const sourceInput = document.querySelector<HTMLTextAreaElement>('#source-tags');
const outputInput = document.querySelector<HTMLTextAreaElement>('#formatted-tags');
const form = document.querySelector<HTMLFormElement>('#formatter-form');
const copyButton = document.querySelector<HTMLButtonElement>('#copy-button');
const clearButton = document.querySelector<HTMLButtonElement>('#clear-button');
const statusMessage = document.querySelector<HTMLElement>('#status-message');
const tagCount = document.querySelector<HTMLElement>('#tag-count');

const TAG_SEPARATOR = /[\s,;|]+/u;
const UNSAFE_TAG_CHARS = /[^\p{L}\p{N}_-]+/gu;
const REPEATED_SEPARATORS = /[-_]{2,}/gu;
const EDGE_SEPARATORS = /^[-_]+|[-_]+$/gu;
const HASH_PREFIX = /^#+/u;

function requireElement<T extends HTMLElement>(element: NullableElement<T>, selector: string): T {
  if (!element) {
    throw new Error(`Required element was not found: ${selector}`);
  }

  return element;
}

const elements = {
  source: requireElement(sourceInput, '#source-tags'),
  output: requireElement(outputInput, '#formatted-tags'),
  form: requireElement(form, '#formatter-form'),
  copyButton: requireElement(copyButton, '#copy-button'),
  clearButton: requireElement(clearButton, '#clear-button'),
  status: requireElement(statusMessage, '#status-message'),
  tagCount: requireElement(tagCount, '#tag-count'),
};

function normalizeTag(rawTag: string): string {
  return rawTag
    .trim()
    .replace(HASH_PREFIX, '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(UNSAFE_TAG_CHARS, '-')
    .replace(REPEATED_SEPARATORS, '-')
    .replace(EDGE_SEPARATORS, '');
}

function formatTags(rawValue: string): FormatResult {
  const uniqueTags = new Map<string, string>();

  rawValue
    .split(TAG_SEPARATOR)
    .map(normalizeTag)
    .filter(Boolean)
    .forEach((tag) => {
      if (!uniqueTags.has(tag)) {
        uniqueTags.set(tag, `#${tag}`);
      }
    });

  const tags = Array.from(uniqueTags.values());

  return {
    value: tags.join(' '),
    count: tags.length,
  };
}

function pluralizeTags(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} тегов`;
  }

  if (lastDigit === 1) {
    return `${count} тег`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} тега`;
  }

  return `${count} тегов`;
}

function setStatus(message: string, tone: 'success' | 'neutral' = 'success'): void {
  elements.status.textContent = message;
  elements.status.dataset.tone = tone;
}

function renderResult(result: FormatResult): void {
  elements.output.value = result.value;
  elements.tagCount.textContent = pluralizeTags(result.count);

  if (result.count === 0) {
    setStatus('Добавьте хотя бы один тег для форматирования.', 'neutral');
    return;
  }

  setStatus(`Готово: ${pluralizeTags(result.count)} отформатировано.`);
}

async function copyFormattedTags(): Promise<void> {
  const value = elements.output.value.trim();

  if (!value) {
    setStatus('Нечего копировать: сначала нажмите Format.', 'neutral');
    elements.source.focus();
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    setStatus('Форматированный текст скопирован в буфер обмена.');
  } catch {
    elements.output.select();
    document.execCommand('copy');
    setStatus('Форматированный текст выделен и скопирован через fallback.');
  }
}

function clearFields(): void {
  elements.source.value = '';
  elements.output.value = '';
  elements.tagCount.textContent = pluralizeTags(0);
  setStatus('Поля очищены.', 'neutral');
  elements.source.focus();
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  renderResult(formatTags(elements.source.value));
}

function handleShortcut(event: KeyboardEvent): void {
  const isSubmitShortcut = (event.ctrlKey || event.metaKey) && event.key === 'Enter';

  if (!isSubmitShortcut) {
    return;
  }

  event.preventDefault();
  renderResult(formatTags(elements.source.value));
}

function initDepthDriver(): void {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  if (prefersReducedMotion || coarsePointer) {
    document.documentElement.style.setProperty('--scroll-y', '0');
    return;
  }

  let rafId = 0;

  const updateScroll = (): void => {
    rafId = 0;
    document.documentElement.style.setProperty('--scroll-y', String(window.scrollY));
  };

  window.addEventListener(
    'scroll',
    () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    },
    { passive: true },
  );
}

function init(): void {
  elements.form.addEventListener('submit', handleSubmit);
  elements.copyButton.addEventListener('click', () => void copyFormattedTags());
  elements.clearButton.addEventListener('click', clearFields);
  elements.source.addEventListener('keydown', handleShortcut);
  initDepthDriver();
}

init();
