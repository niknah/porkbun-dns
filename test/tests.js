/* jshint esversion:8 */
/* jshint node:true */



const tap = require('tap');
const PorkBunDNS = require("../index.js");

class PorkBunDNSTest {
	init() {
		if(!process.argv[4]) {
			console.error("tap test/tests.js --test-arg=YourDomain.com --test-arg=pk1_... --test-arg=sk1_... ");
			process.exit(1);
		}
		this.domain=process.argv[2];
		this.porkBunDNS = new PorkBunDNS(process.argv[3], process.argv[4]);
		this.testName='apitest';
		this.testContent='ok';
		this.testContentEdited='okedited';
		this.testTTL="500";
	}

	testFailLogin() {
		const badPorkBunDNS = new PorkBunDNS('xx','yy');
		tap.rejects( badPorkBunDNS.retrieve(this.domain));
	}
	testPing() {
		return this.porkBunDNS.ping().then((resp) => {
			tap.pass('ping');
		});
	}
	testCreate() {
		return this.porkBunDNS.create(this.domain, this.testName, 'TXT', this.testContent).then((resp) => {
			tap.pass('create');

			tap.ok(resp.id?true:false, 'create returned id');
			this.testId = resp.id;
		});
	}
	testEdit() {
		return this.porkBunDNS.edit(this.domain, this.testId, this.testName, 'TXT', this.testContentEdited)
		.then((resp) => this.retrieve())
		.then((recordsById) => {
			tap.pass('edited');

			var record=recordsById[this.testId];
			tap.ok(record?true:false, "ID found ok:"+this.testId);

			tap.same(record.name.replace(/\..*$/,''), this.testName);
			tap.same(record.id, this.testId, "ID found ok");
			tap.same(record.content, this.testContentEdited, "Content found ok");
		})
		.then(() => this.porkBunDNS.edit(this.domain, this.testId, this.testName, 'TXT', this.testContentEdited+'2', {ttl:this.testTTL}))
		.then((resp) => this.retrieve())
		.then((recordsById) => {
			tap.pass('edited with extra options - TTL');

			var record=recordsById[this.testId];
			tap.ok(record?true:false, "ID found ok:"+this.testId);
			tap.same(record.ttl, this.testTTL, "TTL edited");
		});
	}
	retrieve() {
		return this.porkBunDNS.retrieve(this.domain).then((resp) => {
			tap.pass('retrieve');

			tap.ok((resp.records && resp.records.length>0) ?true:false, 'retrieve returned records');
			var recordsById={};
			resp.records.forEach((record) => {
				tap.ok(recordsById[record.id]?false:true,"record id duplicated: "+record.id+", "+record.name+" and "+JSON.stringify(recordsById[record.id]));
				recordsById[record.id]=record;
			});

			return recordsById;
		});
	}
	testRetrieve() {
		return this.retrieve().then((recordsById) => {
			var record=recordsById[this.testId];
			tap.ok(record?true:false, "ID found ok:"+this.testId);

			tap.same(record.name.replace(/\..*$/,''), this.testName);
			tap.same(record.id, this.testId, "ID found ok");
			tap.same(record.content, this.testContent, "Content found ok");
		});
	}
	delete() {
		return this.porkBunDNS.delete(this.domain, this.testId);
	}
	testDelete() {
		return this.delete().then((resp) => {
			tap.pass('delete');
			this.testId=null;
		}).then(() => this.retrieve() )
		.then((recordsById) => {
			tap.ok(recordsById[this.testId]?false:true, "record deleted");
		});
	}

	async test() {
		tap.on('end',async () => {
			if(this.testId)  {
				await this.delete();
				this.testId=null;
			}
		});
		await this.testFailLogin();
		await this.testPing();
		await this.testCreate();
		await this.testRetrieve();
		await this.testEdit();
		await this.testDelete();
	}
}
const porkBunDNSTest = new PorkBunDNSTest();
porkBunDNSTest.init();
porkBunDNSTest.test();
