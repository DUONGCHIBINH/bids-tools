// Helper function to encode a string to base64url (browser version)
function base64url(source) {
  // Encode string to UTF-8 bytes
  const bytes = new TextEncoder().encode(source);
  // Convert bytes to base64 string
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);
  // Convert base64 to base64url by replacing characters and removing padding
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Helper function to convert ArrayBuffer to base64url string
function base64urlFromBuffer(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let base64 = btoa(binary);
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Function to encode a JWT (browser version, async)
async function encodeJWT(payload, secret) {
  // Create JWT header
  const header = {
    alg: 'HS256', // Algorithm
    typ: 'JWT'    // Token type
  };

  // Encode header and payload to base64url
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));

  // Create the unsigned token
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Encode secret to Uint8Array
  const keyBytes = new TextEncoder().encode(secret);
  // Import the secret key for HMAC SHA-256
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  // Sign the unsigned token
  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );
  // Convert signature to base64url
  const encodedSignature = base64urlFromBuffer(signatureBuffer);

  // Return the complete JWT
  return `${unsignedToken}.${encodedSignature}`;
}

// Function to generate the authentication URL with JWT token
// Parameters:
//   returnCurrentUrl: the URL to redirect after authentication
//   payload: the JWT payload object
//   secret: the secret key for signing JWT
// Returns: a Promise that resolves to the full URL string
async function genUrl(returnCurrentUrl, payload, secret) {
  // Generate JWT token
  const token = await encodeJWT(payload, secret);
  // Construct the URL
  const baseUrl = 'https://brenock-bids-dev.qnois.xyz/api/auth/token';
  // Encode the returnCurrentUrl for use in query string
  const encodedReturnUrl = encodeURIComponent(returnCurrentUrl);
  // Build the full URL
  return `${baseUrl}?returnCurrentUrl=${encodedReturnUrl}&access_token=${token}`;
}


function genDefaultUrl() {
    genUrl(
        'https://brenock-bids-dev.qnois.xyz/users',
        {
          "brenock:userid": "4213c413-e54e-4c36-9702-79a7d80069c2",
          "brenock:username": "brenockadmin",
          "brenock:email": "brenockadmin@hungbtdevgmail.onmicrosoft.com",
          "brenock:firstname": "Brenock",
          "brenock:lastname": "Admin",
          "brenock:roles": "Admin",
          "nbf": 1753368305,
          "exp": 1753968245,
          "iat": 1753368305,
          "iss": "brenock-core",
          "aud": "https://localhost:30411"
        },
        "Hmxfw68zV72gEtGrLKqZpckTCXM9hsPuF"
      ).then(url => {
        // Print the generated URL to the console
        console.log(url);
        return url;
      });
}
