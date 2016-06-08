function* decryptor(event, context) {
    var shift = 1;
    while (true) {
        if (event.decryptInputStream) {
            var inputStream = event.decryptInputStream.toString();
            var decryptedText = '';
            for (var i = 0; i < inputStream.length; i++) {
                decryptedText += String.fromCharCode((128 + inputStream[i].charCodeAt() - shift) % 128);
                shift = (shift + decryptedText[i].charCodeAt()) % 128;
            }
            yield decryptedText;
        }
        yield null;
    }
}
