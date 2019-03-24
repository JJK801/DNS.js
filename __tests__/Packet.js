var Packet = require("../src/Packet");
var Query  = require("../src/Query");
var Resource  = require("../src/Resource");

describe("Handle Unicast Packet", () => {
    var q1 = new Query(
        {
            name:  "test.local",
            type:  Query.Type.get("A"),
            class: Query.Class.get("IN")
        }
    );
    var q2 = new Query(
        {
            name:  "192-168-1-1.in-addr.arpa",
            type:  Query.Type.get("CNAME"),
            class: Query.Class.get("IN")
        }
    );

    var a1 = new Resource(
        {
            name:  "test.local",
            type:  Resource.Type.get("A"),
            class: Resource.Class.get("IN"),
            data:  "192.168.1.1"
        }
    );
    var a2 = new Resource(
        {
            name:  "192-168-1-1.in-addr.arpa",
            type:  Resource.Type.get("CNAME"),
            class: Resource.Class.get("IN"),
            data:  "test.local"
        }
    );

    var p = new Packet({
        id: 3245,
        flags: Packet.getFlag("RESPONSE", 1) | Packet.getFlag("TRUNCATED", 1),
        questions: new Query.Collection(Query, q1, q2),
        answers: new Resource.Collection(Resource, a1, a2)
    });

    it("create", () => {
        expect(p.id).toBe(3245);
        expect(p.flags).toBe(0x8200);
        expect(p.questions.length).toBe(2);
        expect(p.answers.length).toBe(2);
        expect(p.authorities.length).toBe(0);
        expect(p.additional.length).toBe(0);

        p.setHeader("RCODE", 1);

        expect(p.flags).toBe(0x8201);

        p.setHeader("RCODE", 2);

        expect(p.flags).toBe(0x8202);

        p.setHeader("RCODE", 0);

        expect(p.flags).toBe(0x8200);

        p.setHeader("TRUNCATED", 0);

        expect(p.flags).toBe(0x8000);

        p.setHeader("TRUNCATED", 1);

        expect(p.flags).toBe(0x8200);
    });

    var buffer = new DataView(new ArrayBuffer(512));

    it("encode", () => {
        var ctx = { offset: 0 };

        p.encode(buffer, ctx);
    });

    it("parse", () => {
        var ctx = { offset: 0 };

        var decodedpacket = Packet.parse(buffer, ctx);

        expect(p.id).toBe(3245);
        expect(p.flags).toBe(0x8200);
        expect(p.questions.length).toBe(2);
        expect(p.answers.length).toBe(2);
        expect(p.authorities.length).toBe(0);
        expect(p.additional.length).toBe(0);
    });

    it("has utils", () => {
        expect(Packet.getFlag("RESPONSE", 0)).toBe(0);
        expect(Packet.getFlag("RESPONSE", 1)).toBe(0x8000);
        expect(p.getHeader("RESPONSE")).toBe(1);

        expect(Packet.getFlag("OPCODE", 0)).toBe(0);
        expect(Packet.getFlag("OPCODE", 1)).toBe(0x800);
        expect(Packet.getFlag("OPCODE", 2)).toBe(0x1000);
        expect(Packet.getFlag("OPCODE", 3)).toBe(0x1800);
        expect(p.getHeader("OPCODE")).toBe(0);

        expect(Packet.getFlag("AUTHORITATIVE", 0)).toBe(0);
        expect(Packet.getFlag("AUTHORITATIVE", 1)).toBe(0x400);
        expect(p.getHeader("AUTHORITATIVE")).toBe(0);

        expect(Packet.getFlag("TRUNCATED", 0)).toBe(0);
        expect(Packet.getFlag("TRUNCATED", 1)).toBe(0x200);
        expect(p.getHeader("TRUNCATED")).toBe(1);

        expect(Packet.getFlag("RECURSION_DESIRED", 0)).toBe(0);
        expect(Packet.getFlag("RECURSION_DESIRED", 1)).toBe(0x100);
        expect(p.getHeader("RECURSION_DESIRED")).toBe(0);

        expect(Packet.getFlag("RECURSION_AVAILABLE", 0)).toBe(0);
        expect(Packet.getFlag("RECURSION_AVAILABLE", 1)).toBe(0x80);
        expect(p.getHeader("RECURSION_AVAILABLE")).toBe(0);


        expect(Packet.getFlag("RCODE", 0)).toBe(0);
        expect(Packet.getFlag("RCODE", 1)).toBe(0x1);
        expect(Packet.getFlag("RCODE", 2)).toBe(0x2);
        expect(Packet.getFlag("RCODE", 3)).toBe(0x3);
        expect(p.getHeader("RCODE")).toBe(0);

        expect(Packet.getFlag("UNKNOWN", 0)).toBe(0);
    })
});


describe("Handle Unicast Packet", () => {
    var q1 = new Query.Multicast(
        {
            name:  "test.local",
            type:  Query.Multicast.Type.get("A"),
            class: Query.Multicast.Class.get("IN")
        }
    );
    var q2 = new Query.Multicast(
        {
            name:  "192-168-1-1.in-addr.arpa",
            type:  Query.Multicast.Type.get("CNAME"),
            class: Query.Multicast.Class.get("IN")
        }
    );

    var a1 = new Resource.Multicast(
        {
            name:  "test.local",
            type:  Resource.Multicast.Type.get("A"),
            class: Resource.Multicast.Class.get("IN"),
            data:  "192.168.1.1"
        }
    );
    var a2 = new Resource.Multicast(
        {
            name:  "192-168-1-1.in-addr.arpa",
            type:  Resource.Multicast.Type.get("CNAME"),
            class: Resource.Multicast.Class.get("IN"),
            data:  "test.local"
        }
    );

    var p = new Packet.Multicast({
        id: 3245,
        flags: Packet.getFlag("RESPONSE", 1) | Packet.getFlag("TRUNCATED", 1),
        questions: new Query.Multicast.Collection(Query.Multicast, q1, q2),
        answers: new Resource.Multicast.Collection(Resource.Multicast, a1, a2)
    });

    it("create", () => {
        expect(p.id).toBe(3245);
        expect(p.flags).toBe(0x8200);
        expect(p.questions.length).toBe(2);
        expect(p.answers.length).toBe(2);
        expect(p.authorities.length).toBe(0);
        expect(p.additional.length).toBe(0);
    });

    var buffer = new DataView(new ArrayBuffer(512));

    it("encode", () => {
        var ctx = { offset: 0 };

        p.encode(buffer, ctx);
    });

    it("parse", () => {
        var ctx = { offset: 0 };

        var decodedpacket = Packet.parse(buffer, ctx);

        expect(p.id).toBe(3245);
        expect(p.flags).toBe(0x8200);
        expect(p.questions.length).toBe(2);
        expect(p.answers.length).toBe(2);
        expect(p.authorities.length).toBe(0);
        expect(p.additional.length).toBe(0);
    });
});
