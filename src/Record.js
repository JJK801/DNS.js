const DNSUtil = require('./Util');

class Record {
    constructor (data = {}) {
        data = Object.assign({
            name: "",
            class: 0,
            type: 0
        }, data);

        for (var k in data) {
            this[k] = data[k];
        }
    }

    encode (buffer, ctx) {
        DNSUtil.DomainName.encode(buffer, ctx, this.name);          // NAME
        DNSUtil.Uint.encode(buffer, ctx, 16, this.type & 0xffff);   // TYPE
        this.encodeClass(buffer, ctx);                              // CLASS
    }

    encodeClass (buffer, ctx, extra = 0) {
        DNSUtil.Uint.encode(buffer, ctx, 16, this.class | extra & 0xffff);
    }

    static parse (buffer, ctx) {
        const data = {
            name:   DNSUtil.DomainName.parse(buffer, ctx),
            type:   this.Type.get(DNSUtil.Uint.parse(buffer, ctx, 16)),
            class:  this.Class.get(DNSUtil.Uint.parse(buffer, ctx, 16))
        }

        return new this(data);
    }
}

module.exports = Record;

class RecordQualifier {
    constructor (id, name) {
        this.id = id;
        this.name = name;

        if (!this.constructor._entries) {
            Object.defineProperty(this.constructor, '_entries', {
                enumerable: false,
                writeable: false,
                value: []
            });
        }

        this.constructor._entries.push(this);
    }

    toString () {
        return this.name;
    }

    valueOf () {
        return this.id;
    }

    static get (name) {
        var key;
        var defaut = name;

        if (typeof name === "string") {
            key = "name";
            defaut = undefined;
        } else {
            key = "id";
        }

        return (this._entries || []).find((t) => t[key] === name) || defaut;
    }
}

class RecordClass extends RecordQualifier {
    match (record) {
        return ((record.class == this) || (record.class.id === 255));
    }
}

Record.Class = RecordClass;

class RecordType extends RecordQualifier {
    constructor (id, name, encoder, parser) {
        super(id, name);

        this.parseData = parser;
        this.encodeData = encoder;
    }

    match (record) {
        return ((record.type === this) || (record.type.id === 255));
    }
}

Record.Type = RecordType;

class RecordCollection extends Array {
    constructor (recordType) {
        var args = Object.values(arguments).slice(1);

        if (Number.isInteger(args[0]) && args.length == 1) {
            super(args[0]);
            args = args.slice(1);
        } else {
            super();
        }

        for (var i in args) {
            this[i] = args[i];
        }

        Object.defineProperty(this, '_recordType', {
            enumerable: false,
            writeable: false,
            value: recordType
        });
    }

    encode (buffer, ctx) {
        for (var i = 0; i < this.length; i++) {
            this[i].encode(buffer, ctx);
        }
    }

    encodeLength (buffer, ctx) {
        DNSUtil.Uint.encode(buffer, ctx, 16, this.length);
    }

    parse (buffer, ctx) {
        for (var i = 0; i < this.length; i++) {
            this[i] = this._recordType.parse(buffer, ctx);
        }
    }

    static init (buffer, ctx, recordType) {
        var length = DNSUtil.Uint.parse(buffer, ctx, 16);

        return new RecordCollection(recordType, length);
    }
}


Record.Collection = RecordCollection;


/* Default qualifiers */

new RecordClass(1, "IN");

new RecordType (
    1,
    "A",
    DNSUtil.Address.encode,
    DNSUtil.Address.parse
);

new RecordType (
    5,
    "CNAME",
    DNSUtil.DomainName.encode,
    DNSUtil.DomainName.parse
);

new RecordType (
    12,
    "PTR",
    DNSUtil.DomainName.encode,
    DNSUtil.DomainName.parse
);
