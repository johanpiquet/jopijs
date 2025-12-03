# Enable HTTPS

To enable HTTPS, two things are necessary:
* Define an address in HTTPS.
* Associate an SSL certificate to allow encryption of communications.

## Define the site URL

With Jopi, you have two ways to set the website URL: either by explicitly specifying the URL, or by using the environment variable JOPI_WEBSITE_LISTENING_URL (or JOPI_WEBSITE_URL).

```typescript
import {jopiApp} from "jopijs";

jopiApp.startApp(import.meta, jopiEasy => {
	// Here I explicitly set the website url.
    jopiEasy.create_webSiteServer("https://localhost");

    // Here I don't set it.
    // It will use process.env.JOPI_WEBSITE_LISTENING_URL.
    // With a fallback to process.env.JOPI_WEBSITE_URL.
    //
    jopiEasy.create_webSiteServer();
});
```

## Use an SSL certificate

Jopi offers three ways to provide an SSL certificate:
* Implicitly, by placing your certificate in the "./certs" folder (next to package.json).
* By asking Jopi to generate a development certificate (usable locally only).
* By asking Jopi to use LetsEncrypt.

### Use the certs folder

Assuming your site has the URL `https://mysite.com:3000`, here is where to place the certificate.

```
|- package.json
|- certs/
   |- mysite.com/
	 |- certificate.key
	 |- certificate.crt.key
```

## Use a development certificate

```typescript
import {jopiApp} from "jopijs";

jopiApp.startApp(import.meta, jopiEasy => {
	jopiEasy.create_webSiteServer()
	  .add_httpCertificate()
	    .generate_localDevCert()
	    .DONE_add_httpCertificate()
});
```

### Use LetsEncrypt

```typescript
import {jopiApp} from "jopijs";

jopiApp.startApp(import.meta, jopiEasy => {
    jopiEasy.create_webSiteServer(`https://mysite.com:3000`)
        .add_httpCertificate()
            .generate_letsEncryptCert("myemail@me.com")
            .force_expireAfter_days(30) // Optional
            .enable_production(true) // Optional
            .disable_log() // Optional
            .DONE_add_httpCertificate();
});
```
