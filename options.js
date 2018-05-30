const backgroundPage = chrome.extension.getBackgroundPage();
let HandlerTimeout;

document.addEventListener('DOMContentLoaded', function () {
    getSelectedTheme();
    document.querySelector('#nzqm-shortcuts').addEventListener('click', openShortcutsView);
    document.querySelector('#theme-select').addEventListener('change', saveOptions)
});

function openShortcutsView() {
    backgroundPage.openShortcutsView();
}

function optionChanged(value) {
    setPreview(value);
}

function saveOptions() {
    const value = document.querySelector('#theme-select').value;
    chrome.storage.sync.set({ 'theme': value }, function () {
        setPreview(value);
        const successParagraph = document.querySelector('#nzqm-operation-result p');
        const msg = 'Theme correctly setted';
        handleResponse(successParagraph, 'success', msg);
    });
}

function getSelectedTheme() {
    chrome.storage.sync.get(['theme'], function (result) {
        if (result && result['theme']) {
            const selectEl = document.querySelector('#theme-select');
            const attribute = "[value=" + result['theme'] + "]";
            selectEl.querySelector(attribute).setAttribute('selected', true);
            setPreview(result['theme']);
        } else {
            setPreview('light');
        }

    });
}

function setPreview(theme) {
    if (theme instanceof Object) theme = theme.target.value;
    const previewImage = document.querySelector('#nzqm-theme-preview');
    const imageUrl = 'img/themes/' + theme + '.png';
    previewImage.setAttribute('src', imageUrl);
}

function handleResponse(element, type, msg) {
    element.classList.add(type);
    element.innerHTML = msg;
    if (HandlerTimeout) clearTimeout(HandlerTimeout);
    clearHandle(element, type)
}

function clearHandle(element, classToRemove) {
    HandlerTimeout = setTimeout(() => {
        element.classList.remove(classToRemove);
        element.innerHTML = '';
    }, 3000)
}




