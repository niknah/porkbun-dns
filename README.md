
Access to the Porkbun.com API using node or web browser.

```
const porkBunDNS = new PorkBunDNS("apikey", "secretapikey");

const id;
await porkBunDNS.create("YouDomain.com", "www", "A", "YourIPAddress").then((resp) => {
	id=resp.id;
});

await porkBunDNS.edit("YouDomain.com", id, "www", "A", "YourNewIPAddress");

await porkBunDNS.delete("YouDomain.com", id);

const listOfRecords = await porkBunDNS.retrieve("YouDomain.com");

```

[Porkbun documentation](https://porkbun.com/api/json/v3/documentation)



To run the test...

```
tap test/tests.js --test-arg=YourDomain.com --test-arg=YourApiKey --test-arg=YourSecretApiKey

```
