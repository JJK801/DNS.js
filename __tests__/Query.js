var Query = require("../src/Query");

describe("Handle Query", () => {
    it("create unicast", () => {
        var q = new Query({
            name:  "test.local",
            type:  Query.Type.get("A"),
            class: Query.Type.get("IN")
        });

        expect(q.name).toBe("test.local");
        expect(q.type).toBe(Query.Type.get("A"));
        expect(q.class).toBe(Query.Type.get("IN"));

        var a = q.prepareAnswer("192.168.1.1");

        expect(a.name).toBe(q.name);
        expect(a.type).toBe(q.type);
        expect(a.class).toBe(q.class);
        expect(a.ttl).toBe(0);
        expect(a.data).toBe("192.168.1.1");
    });

    var q = new Query.Multicast({
        name:  "test.local",
        type:  Query.Type.get("A"),
        class: Query.Type.get("IN"),
        unicastResponse: true
    });

    var buffer = new DataView(new ArrayBuffer(512));

    it("create multicast", () => {

        expect(q.name).toBe("test.local");
        expect(q.type).toBe(Query.Type.get("A"));
        expect(q.class).toBe(Query.Type.get("IN"));
        expect(q.unicastResponse).toBe(true);

        var a = q.prepareAnswer("192.168.1.1");

        expect(a.name).toBe(q.name);
        expect(a.type).toBe(q.type);
        expect(a.class).toBe(q.class);
        expect(a.data).toBe("192.168.1.1");
    });

    it("encode multicast", () => {
        var ctx = { offset: 0 };

        q.encode(buffer, ctx);
    });

    it("parse multicast", () => {
        var ctx = { offset: 0 };

        var decodedquery = Query.Multicast.parse(buffer, ctx);

        expect(decodedquery.unicastResponse).toBe(true);
    });
});
