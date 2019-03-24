var Record = require("../src/Record");

describe("Handle Types", () => {
    it ("have default types (A, CNAME, PTR)", () => {
        expect(Record.Type._entries.length).toBe(3);

        var A = Record.Type.get("A")

        expect(A).toBe(Record.Type.get(A.id));
        expect(A).toBeInstanceOf(Record.Type);
        expect(A.id).toBe(1);
        expect(A.name).toBe("A");
        expect(0 + A).toBe(A.id);
        expect(`${A}`).toBe(A.name);

        var CNAME = Record.Type.get("CNAME");

        expect(CNAME).toBe(Record.Type.get(CNAME.id));
        expect(CNAME).toBeInstanceOf(Record.Type);
        expect(CNAME.id).toBe(5);
        expect(CNAME.name).toBe("CNAME");
        expect(0 + CNAME).toBe(CNAME.id);
        expect(`${CNAME}`).toBe(CNAME.name);

        var PTR = Record.Type.get("PTR")

        expect(PTR).toBe(Record.Type.get(PTR.id));
        expect(PTR).toBeInstanceOf(Record.Type);
        expect(PTR.id).toBe(12);
        expect(PTR.name).toBe("PTR");
        expect(0 + PTR).toBe(PTR.id);
        expect(`${PTR}`).toBe(PTR.name);
    });

    it ("register new types (new Record.Type)", () => {
        var parserCalls  = 0;
        var encoderCalls = 0;

        var TEST = new Record.Type(
            1234,
            "TEST",
            () => encoderCalls++,
            () => parserCalls++
        );

        expect(TEST).toBe(Record.Type.get("TEST"));
        expect(TEST).toBe(Record.Type.get(TEST.id));
        expect(TEST).toBeInstanceOf(Record.Type);
        expect(TEST.id).toBe(1234);
        expect(TEST.name).toBe("TEST");
        expect(0 + TEST).toBe(TEST.id);
        expect(`${TEST}`).toBe(TEST.name);

        expect(parserCalls).toBe(0);
        expect(encoderCalls).toBe(0);

        TEST.parseData();

        expect(parserCalls).toBe(1);
        expect(encoderCalls).toBe(0);

        TEST.encodeData();

        expect(parserCalls).toBe(1);
        expect(encoderCalls).toBe(1);
    });
});

describe("Handle Classes", () => {
    it ("have default class (IN)", () => {
        expect(Record.Class._entries.length).toBe(1);

        var IN = Record.Class.get("IN")

        expect(IN).toBe(Record.Class.get(IN.id));
        expect(IN).toBeInstanceOf(Record.Class);
        expect(IN.id).toBe(1);
        expect(IN.name).toBe("IN");
        expect(0 + IN).toBe(IN.id);
        expect(`${IN}`).toBe(IN.name);
    });

    it ("register new types (new Record.Class)", () => {
        var CLASS = new Record.Class(
            5678,
            "CLASS"
        );

        expect(CLASS).toBe(Record.Class.get("CLASS"));
        expect(CLASS).toBe(Record.Class.get(CLASS.id));
        expect(CLASS).toBeInstanceOf(Record.Class);
        expect(CLASS.id).toBe(5678);
        expect(CLASS.name).toBe("CLASS");
        expect(0 + CLASS).toBe(CLASS.id);
        expect(`${CLASS}`).toBe(CLASS.name);
    });
});

describe("Handle Collections", () => {
    it ("create empty collections", () => {
        var rcol = new Record.Collection(Record);

        expect(rcol).toBeInstanceOf(Array);
        expect(rcol).toBeInstanceOf(Record.Collection);
        expect(rcol._recordType).toBe(Record);
        expect(rcol.length).toBe(0);
    });

    it ("create sized empty collections", () => {
        var rcol = new Record.Collection(Record, 5);

        expect(rcol).toBeInstanceOf(Array);
        expect(rcol).toBeInstanceOf(Record.Collection);
        expect(rcol._recordType).toBe(Record);
        expect(rcol.length).toBe(5);
    });

    var r1 = new Record({
        name: "test.local",
        type: Record.Type.get("A"),
        class: Record.Class.get("IN")
    });
    var r2 = new Record({
        name: "cname.test.local",
        type: Record.Type.get("CNAME"),
        class: Record.Class.get("IN")
    });
    var r3 = new Record({
        name: "ptr.test.local",
        type: Record.Type.get("PTR"),
        class: Record.Class.get("IN")
    });
    var rcol = new Record.Collection(Record, r1, r2, r3);

    it ("create filled collections", () => {
        expect(rcol).toBeInstanceOf(Array);
        expect(rcol).toBeInstanceOf(Record.Collection);
        expect(rcol._recordType).toBe(Record);
        expect(rcol.length).toBe(3);
        expect(rcol[0]).toBe(r1);
        expect(rcol[1]).toBe(r2);
        expect(rcol[2]).toBe(r3);
    });

    var buffer = new DataView(new ArrayBuffer(512));

    it ("encode collections", () => {
        var ctx = { offset: 0};

        rcol.encodeLength(buffer, ctx);
        rcol.encode(buffer, ctx);
    });

    it ("parse collections", () => {
        var ctx = { offset: 0};
        var decodedrcol = Record.Collection.init(buffer, ctx, Record);

        expect(decodedrcol).toBeInstanceOf(Array);
        expect(decodedrcol).toBeInstanceOf(Record.Collection);
        expect(decodedrcol._recordType).toBe(Record);
        expect(decodedrcol.length).toBe(3);

        decodedrcol.parse(buffer, ctx);

        decodedrcol.forEach((record, i) => {
            expect(record.type).toBe(rcol[i].type);
            expect(record.class).toBe(rcol[i].class);
            expect(rcol[i].type.match(record)).toBe(true);
            expect(rcol[i].class.match(record)).toBe(true);
        });
    });
})
