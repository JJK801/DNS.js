var Resource = require("../src/Resource");

describe("Handle Unicast Resource", () => {
    var a = new Resource({
        name:  "test.local",
        type:  Resource.Type.get("A"),
        class: Resource.Type.get("IN"),
        ttl:   86400,
        data:  "192.168.1.1"
    });

    it("create", () => {
        expect(a.name).toBe("test.local");
        expect(a.type).toBe(Resource.Type.get("A"));
        expect(a.class).toBe(Resource.Type.get("IN"));
        expect(a.ttl).toBe(86400);
        expect(a._data.parse()).toBe("192.168.1.1");
        expect(a.data).toBe("192.168.1.1");

        a.data = "192.168.1.2";

        expect(a._data.parse()).toBe("192.168.1.2");
        expect(a.data).toBe("192.168.1.2");

        a.data = "192.168.1.1";
    });

    var buffer = new DataView(new ArrayBuffer(512));

    it("encode", () => {
        var ctx = { offset: 0 };

        a.encode(buffer, ctx);
    });

    it("parse", () => {
        var ctx = { offset: 0 };

        var decodedresource = Resource.parse(buffer, ctx);

        expect(decodedresource.ttl).toBe(86400);
        expect(decodedresource.data).toBe("192.168.1.1");
    });
});

describe("Handle Milticast Resource", () => {
    var a = new Resource.Multicast({
        name:  "test.local",
        type:  Resource.Type.get("A"),
        class: Resource.Type.get("IN"),
        ttl:   86400,
        flushCache: true,
        data:  "192.168.1.1"
    });

    it("create", () => {
        expect(a.name).toBe("test.local");
        expect(a.type).toBe(Resource.Type.get("A"));
        expect(a.class).toBe(Resource.Type.get("IN"));
        expect(a.ttl).toBe(86400);
        expect(a.flushCache).toBe(true);
        expect(a._data.parse()).toBe("192.168.1.1");
        expect(a.data).toBe("192.168.1.1");

        a.data = "192.168.1.2";

        expect(a._data.parse()).toBe("192.168.1.2");
        expect(a.data).toBe("192.168.1.2");

        a.data = "192.168.1.1";
    });

    var buffer = new DataView(new ArrayBuffer(512));

    it("encode", () => {
        var ctx = { offset: 0 };

        a.encode(buffer, ctx);
    });

    it("parse", () => {
        var ctx = { offset: 0 };

        var decodedresource = Resource.Multicast.parse(buffer, ctx);

        expect(decodedresource.ttl).toBe(86400);
        expect(decodedresource.flushCache).toBe(true);
        expect(decodedresource.data).toBe("192.168.1.1");
    });
});
