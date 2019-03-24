var Record = require('./Record');
var Resource = require('./Resource');

class Query extends Record {
    prepareAnswer (data, ResourceType) {
        var answer = new (ResourceType || Resource)({
            name: this.name,
            type: this.type,
            class: this.class,
            data: data
        });

        return answer;
    }
}

class MulticastQuery extends Query {
    constructor(data={}){
        super(
            Object.assign({
                unicastResponse: false
            },data)
        )
    }

    static parse(buffer, ctx){
        var data = super.parse(buffer, ctx);

        var classId = data.class.id ? data.class.id : data.class;

        data.unicastResponse = !!(classId >> 15);
        data.class = this.Class.get(0x7fff & classId);

        return data;
    }

    encodeClass(buffer, ctx){
        super.encodeClass(buffer, ctx, this.unicastResponse << 15);
    }

    prepareAnswer (data, packet) {
        return super.prepareAnswer(data, packet, Resource.Multicast);
    }
}

Query.Multicast = MulticastQuery;

module.exports = Query;
