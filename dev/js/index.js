document.addEventListener('DOMContentLoaded', (event) => {
    // https://stackoverflow.com/questions/25523806/google-maps-v3-prevent-api-from-loading-roboto-font
    const head = document.getElementsByTagName('head')[0];
    const insertBefore = head.insertBefore;
    head.insertBefore = function (newElement, referenceElement) {
        if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') > -1) {
            return;
        }
        insertBefore.call(head, newElement, referenceElement);
    };
});

// https://developers.google.com/web/fundamentals/primers/service-workers/
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').then(function (registration) {
            // registration success
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            // registration failure
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
