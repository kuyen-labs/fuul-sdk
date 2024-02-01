import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { getQueryParam } from '../utils/query-params';
import { TWStyles } from './styles/main';

const DEFAULT_TITLE = 'You have been referred by a Fuul powered affiliate program!';
const DEFAULT_SUBTITLE = 'You will now be redirected to the website.';

@customElement('fuul-modal')
export class FuulModal extends LitElement {
  @property({ type: String })
  modalTitle?: string;

  @property({ type: String })
  modalSubtitle?: string;

  static styles = [TWStyles];

  connectedCallback(): void {
    super.connectedCallback();

    this.modalTitle = this.getAttribute('modal-title') ?? DEFAULT_TITLE;
    this.modalSubtitle = this.getAttribute('modal-subtitle') ?? DEFAULT_SUBTITLE;
  }

  protected render() {
    return html`<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"></div>
      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <svg
                    class="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">${this.modalTitle}</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">${this.modalSubtitle}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-slate-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-400 sm:ml-3 sm:w-auto"
              >
                CTA Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div> `;
  }
}

const btn = document.querySelector('#show-modal');

btn?.addEventListener('click', () => {
  showSuccessfullReferralModal();
});

interface ModalOptions {
  titlePrefix?: string;
  showAffiliate?: boolean;
  subtitle?: string;
}

const buildTitle = (titlePrefix?: string, showAffiliateAddress?: boolean) => {
  if (showAffiliateAddress) {
    return `${titlePrefix ?? 'You have been referred by'} ${getQueryParam('af') || getQueryParam('referrer')}!`;
  }

  return `${titlePrefix ?? 'You have been referred by a Fuul powered affiliate program'}!`;
};

export const showSuccessfullReferralModal = (options?: ModalOptions) => {
  const modal = document.createElement('fuul-modal');

  modal.setAttribute('modal-title', buildTitle(options?.titlePrefix, options?.showAffiliate));
  modal.setAttribute('modal-subtitle', options?.subtitle ?? 'You will now be redirected to the website.');

  document.body.appendChild(modal);
};
