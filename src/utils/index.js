function removeLastUrl(url = "") {
    let newUrl = url;
    if (url[url.length - 1] === '/') {
        newUrl = url.substring(0, url.length - 1);
    }

    return newUrl;
}

module.exports = {
    removeLastUrl,
}