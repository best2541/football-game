async function generateHmacKey() {
    return await crypto.subtle.generateKey(
        {
            name: "HMAC",
            hash: { name: "SHA-256" },
        },
        true, // Whether the key is extractable (can be used in exportKey)
        ["sign", "verify"] // What this key can do
    );
}

async function createHmac(key, data) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encodedData
    );

    return signature; // This will be an ArrayBuffer
}

// Helper function to convert ArrayBuffer to Hex string
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Example usage
(async () => {
    const key = await generateHmacKey();
    const data = "Hello, World!";
    const hmac = await createHmac(key, data);
    
    console.log(bufferToHex(hmac)); // Outputs the HMAC as a hex string
})();
