/*
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features

  const isLocalhost = Boolean(window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );

  if (
    'serviceWorker' in navigator
    && (window.location.protocol === 'https:' || isLocalhost)
  ) {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(registration) {
        // updatefound is fired if service-worker.js changes.
        registration.onupdatefound = function() {
          // updatefound is also fired the very first time the SW is installed,
          // and there's no need to prompt for a reload at that point.
          // So check here to see if the page is already controlled,
          // i.e. whether there's an existing service worker.
          if (navigator.serviceWorker.controller) {
            // The updatefound event implies that registration.installing is set
            // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
            const installingWorker = registration.installing;

            installingWorker.onstatechange = function() {
              switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                    'service worker became redundant.');

              default:
                  // Ignore
              }
            };
          }
        };
      }).catch(function(e) {
        console.error('Error during service worker registration:', e);
      });
  }

  // Your custom JavaScript goes here
  const $baconCloneButton = document.getElementById('cloneBaconButton');
  const cloneBacon = () => {
    const $baconSection = document.getElementById('baconSection');
    const $baconImage = $baconSection.lastElementChild;
    const $clonedBaconImage = $baconImage.cloneNode();

    $baconImage.parentElement.appendChild($clonedBaconImage);
  };
  $baconCloneButton.addEventListener('click', cloneBacon);

  // form handling
  const $purchaseForm = document.getElementById('purchaseForm');
  const validationObject = {
    firstName: {
      validation: /[a-zA-Z]+/,
      validationType: 'regex',
      error: 'Field invalid',
    },
    lastName: {
      validation: /[a-zA-Z]+/,
      validationType: 'regex',
      error: 'Field invalid',
    },
    email: {
      // eslint-disable-next-line max-len
      validation: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      validationType: 'regex',
      error: 'Wrong email address',
    },
    country: {
      validation: /[a-zA-Z]+/,
      validationType: 'regex',
      error: 'Field invalid',
    },
    postal: {
      validation: /^(([0-9]{2,2})(-[0-9]{3,3})|([0-9]{5,5})){1,6}?$/,
      validationType: 'regex',
      error: 'Wrong postal number',
    },
    phone: {
      validation: /^[0-9\s- ()\+]{9,15}$/,
      validationType: 'regex',
      error: 'Wrong phone number',
    },
    creditCard: {
      validation: /^.{16,19}$/,
      validationType: 'regex',
      error: 'Wrong credit card number, must be 16 digits at least',
    },
    securityCode: {
      validation: /\d{3}$/,
      validationType: 'regex',
      error: 'Wrong security code',
    },
    expDate: {
      validation: null,
      validationType: 'date',
      error: 'Field invalid',
    },
  };

  const serialize = (form) => {
    const values = {};
    const inputs = form.elements;

    for (const input of inputs) {
      if (input.id) {
        values[input.id] = {
          value: input.value,
        };
      }
    }
    return values;
  };

  const showError = (element, message) => {
    const $errorElement = document.createElement('span');
    $errorElement.className = 'error';
    $errorElement.innerHTML = message;
    element.appendChild($errorElement);
  };

  const clearError = (element) => {
    const $errorElement = element.getElementsByClassName('error')[0];
    if ($errorElement) {
      $errorElement.remove();
    }
  };

  const validate = (form, validationObject) => {
    const serializedFormData = serialize(form);
    let validationSuccess = true;

    Object.keys(serializedFormData).forEach((fieldKey) => {
      const $fieldGroup = document.getElementById(fieldKey).parentElement;
      const {validationType, validation, error} = validationObject[fieldKey];
      const inputValue = serializedFormData[fieldKey].value;

      clearError($fieldGroup);

      if (validationType === 'regex') {
        const regex = new RegExp(validation);

        if (!inputValue || !regex.test(inputValue)) {
          validationSuccess = false;
          showError($fieldGroup, error);
        }
      }

      if (validationType === 'date') {
        const dateString = new Date(inputValue).toString();
        if (!inputValue || dateString === 'Invalid Date') {
          validationSuccess = false;
          showError($fieldGroup, error);
        }
      }
    });

    return validationSuccess;
  };

  $purchaseForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const $panelSuccess = document.querySelector('.form__info-panel--success');
    const $panelError = document.querySelector('.form__info-panel--error');
    const $purchaseTable = document.getElementById('purchaseTable');
    if (validate(event.target, validationObject)) {
      $panelSuccess.className = $panelSuccess.className.replace('hidden', '');
      if (!$panelError.className.includes('hidden')) {
        $panelError.className = $panelError.className + ' hidden';
      }
      $purchaseForm.className = $purchaseForm.className + ' inactive';
      $purchaseTable.className = $purchaseTable.className + ' inactive';
    } else {
      $panelError.className = $panelError.className.replace('hidden', '');
      if (!$panelSuccess.className.includes('hidden')) {
        $panelSuccess.className = $panelSuccess.className + ' hidden';
      }
    }
  });

  $purchaseForm.addEventListener('click', (event) => {
    const {className, parentElement} = event.target;
    if (className.includes('field') && !className.includes('fieldset')) {
      clearError(parentElement);
    }
  });

})();
