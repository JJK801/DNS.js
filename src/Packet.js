const DNSUtil  = require('./Util');
const Query    = require('./Query');
const Resource = require('./Resource');

class Packet {
    constructor (data = {}) {
        data = Object.assign({
            id: 0,
            flags: 0,
            questions:      new Query.Collection(this.constructor.queryType()),
            answers:        new Resource.Collection(this.constructor.resourceType()),
            authorities:    new Resource.Collection(this.constructor.resourceType()),
            additional:     new Resource.Collection(this.constructor.resourceType()),
        }, data);

        for (var k in data) {
            this[k] = data[k];
        }
    }

    encode () {
        const ctx = { offset: 0 };
        const buffer = new DataView(new ArrayBuffer(512));

        DNSUtil.Uint.encode(buffer, ctx, 16, this.id);     // ID
        DNSUtil.Uint.encode(buffer, ctx, 16, this.flags);  // FLAGS

        this.questions.encodeLength(buffer, ctx);       // QDCOUNT
        this.answers.encodeLength(buffer, ctx);         // ANCOUNT
        this.authorities.encodeLength(buffer, ctx);     // NSCOUNT
        this.additional.encodeLength(buffer, ctx);      // ARCOUNT

        this.questions.encode(buffer, ctx);             // QR
        this.answers.encode(buffer, ctx);               // AN
        this.authorities.encode(buffer, ctx);           // NS
        this.additional.encode(buffer, ctx);            // AR

        return new DataView(buffer.buffer.slice(0, ctx.offset));
    }

    static parse (buffer, ctx) {
        ctx = ctx || { offset: 0 };

        ctx.offset = ctx.offset || 0;

        var data = {
            id:         DNSUtil.Uint.parse(buffer, ctx, 16),
            flags:      DNSUtil.Uint.parse(buffer, ctx, 16),
            questions:  Query.Collection.init(buffer, ctx, this.queryType()),
            answers:    Resource.Collection.init(buffer, ctx, this.resourceType()),
            authorities:Resource.Collection.init(buffer, ctx, this.resourceType()),
            additional: Resource.Collection.init(buffer, ctx, this.resourceType())
        };

        data.questions.parse(buffer, ctx);
        data.answers.parse(buffer, ctx);
        data.authorities.parse(buffer, ctx);
        data.additional.parse(buffer, ctx);

        return new this(data);
    }

    static queryType () {
        return Query;
    }

    static resourceType () {
        return Resource;
    }

    static headerMask (name) {
        switch (name) {
            case "RCODE":
                return 0xF;
            case "RECURSION_AVAILABLE":
                return 0x80;
            case "RECURSION_DESIRED":
                return 0x100;
            case "TRUNCATED":
                return 0x200;
            case "AUTHORITATIVE":
                return 0x400;
            case "OPCODE":
                return 0x7800;
            case "RESPONSE":
                return 0x8000;
            default:
                return 0x0;
        }
    }

    getHeader (name) {
        var mask = Packet.headerMask(name);
        var val = mask & this.flags;

        if (mask > 0) {
            while (!(mask & 1)) {
                mask >>= 1;
                val  >>= 1;
            }
        }

        return val;
    }

    static getFlag (name, val) {
        var mask = Packet.headerMask(name);

        if (mask > 0) {
            while (!(mask & 1)) {
                mask >>= 1;
                val  <<= 1;
            }
        }

        return val;
    }

    setHeader(name, val) {
        var flag = Packet.getFlag(name, val);
        var mask = Packet.headerMask(name);

        this.flags = (this.flags & ~mask) | (flag & mask);
    }
}

class MulticastPacket extends Packet {
    static queryType () {
        return Query.Multicast;
    }

    static resourceType () {
        return Resource.Multicast;
    }
}

Packet.Multicast = MulticastPacket;

module.exports = Packet;
