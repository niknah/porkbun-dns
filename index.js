/* jshint esversion:6 */
/* jshint node:true */

const fetch = require('node-fetch');

class PorkBunDNS {
	constructor(apiKey, secretKey) {
		this.apiKey = apiKey;
		this.secretKey = secretKey;
	}

	request(cmd, json) {
		return fetch('https://porkbun.com/api/json/v3/'+cmd,{
			method: 'post',
			body:    JSON.stringify(Object.assign({"apikey":this.apiKey, "secretapikey":this.secretKey}, json )),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(res => res.json())
		.then(body => {
			if(body.status != 'SUCCESS')
				throw new Error("PorkBunDNS failed: cmd:"+cmd+','+JSON.stringify(body));
			return body;
		});
	}

	ping() {
		return this.request('ping',{});
	}
	retrieve(domain) {
		return this.request('dns/retrieve/'+domain, {} );
	}
	delete(domain, id) {
		return this.request('dns/delete/'+domain+'/'+id, {} );
	}
	edit(domain, id, name, type, content, options) {
		var json={
			name:name,
			type:type,
			content:content
		};
		return this.request('dns/edit/'+domain+'/'+id, Object.assign(json, options || {}) );
	}
	create(domain, name, type, content, options) {
		var json={
			name:name,
			type:type,
			content:content
		};
		return this.request('dns/create/'+domain, Object.assign(json, options || {}));
	}
}

module.exports = PorkBunDNS;
