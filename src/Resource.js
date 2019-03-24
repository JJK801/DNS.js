const DNSUtil = require('./Util');
const Record = require('./Record');

function ensureData (obj) {
    if (!obj._data) {
        Object.defineProperty(obj, '_data', {
            enumerable: false,
            writeable:  false,
            value:      new ResourceData(obj)
        });
    }
}

class Resource extends Record {
    constructor (data = {}) {
        super(
            Object.assign({
                ttl: 0
            }, data)
        );
    }

    get data () {
        ensureData(this);

        return this._data.parse();
    }

    set data (value) {
        ensureData(this);

        this._data.fromValue(value);
    }

    encode (buffer, ctx) {
        ensureData(this);

        super.encode(buffer, ctx);

        DNSUtil.Uint.encode(buffer, ctx, 32, this.ttl); // TTL
        this._data.encode(buffer, ctx); // RDLENGTH + RDATA
    }

    static parse (buffer, ctx) {
        const data = super.parse(buffer, ctx);

        ensureData(data);

        data.ttl = DNSUtil.Uint.parse(buffer, ctx, 32); // TTL

        data._data.fromBuffer(buffer, ctx); // RDLENGTH + RDATA

        return data;
    }
}


class ResourceData {
    constructor (resource) {
        this.resource = resource;
    }

    fromBuffer (buffer, ctx) {
        const len = DNSUtil.Uint.parse(buffer, ctx, 16);

        this.buffer = new DataView(buffer.buffer, ctx.offset, len);

        ctx.offset += len;
    }

    fromValue (value) {
        this.value = value;
    }

    encode (buffer, ctx) {
        DNSUtil.Uint.encode(buffer, ctx, 16, 0); // Placehold the data length

        var start = ctx.offset;

        this.resource.type.encodeData(buffer, ctx, this.value);

        buffer.setUint16(start - 2, (ctx.offset - start)); // Fill the data length
    }

    parse () {
        if (!this.value) {
            this.value = this.resource.type.parseData(this.buffer, { offset: 0 });
        }

        return this.value;
    }
}

class MulticastResource extends Resource{
    constructor(data={}){
        super(
            Object.assign({
                flushCache: false
            }, data)
        )
    }

    static parse(buffer, ctx){
        var data = super.parse(buffer, ctx);

        var classId = data.class.id ? data.class.id : data.class;

        data.flushCache = !!(classId >> 15);
        data.class = this.Class.get(0x7fff & classId);

        return data;
    }

    encodeClass(buffer, ctx){
        super.encodeClass(buffer, ctx, this.flushCache << 15);
    }
}

Resource.Multicast = MulticastResource;

module.exports = Resource;
