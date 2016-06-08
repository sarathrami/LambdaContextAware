function* encryptor(event, context) {
    var shift = 1;
    while (true) {
        if (event.encryptInputStream) {
            var inputStream = event.encryptInputStream.toString();
            var encryptedText = '';
            for (var i = 0; i < inputStream.length; i++) {
                encryptedText += String.fromCharCode((inputStream[i].charCodeAt() + shift) % 128);
                shift = (shift + inputStream[i].charCodeAt()) % 128;
            }
            yield encryptedText;
        }
        yield null;
    }
}
