var Util = require('../src/Util');

var fixtures = {
    "Hello world":      '\x48\x65\x6C\x6C\x6F\x20\x77\x6F\x72\x6C\x64',
    "user@domain.tld":  '\x75\x73\x65\x72\x40\x64\x6F\x6D\x61\x69\x6E\x2E\x74\x6C\x64',
    "éà%*€":            '\xC3\xA9\xC3\xA0\x25\x2A\xE2\x82\xAC'
}

describe("Handle buffers", () => {
    var buffer = new DataView(new ArrayBuffer(7));

    it("push various sized uint (Util.Uint::encode)", () => {
        var ctx = { offset: 0 };

        Util.Uint.encode(buffer, ctx, 8, 16);

        expect(ctx.offset).toBe(1);

        Util.Uint.encode(buffer, ctx, 16, 3290);

        expect(ctx.offset).toBe(3);

        Util.Uint.encode(buffer, ctx, 32, 1);

        expect(ctx.offset).toBe(7);
    });

    it("pull various sized uint (Util.Uint.parse)", () => {
        var ctx = { offset: 0 };

        expect(Util.Uint.parse(buffer, ctx, 8)).toBe(16);

        expect(ctx.offset).toBe(1);

        expect(Util.Uint.parse(buffer, ctx, 16)).toBe(3290);

        expect(ctx.offset).toBe(3);

        expect(Util.Uint.parse(buffer, ctx, 32)).toBe(1);

        expect(ctx.offset).toBe(7);
    });
})

describe('Handle DNS character strings', () => {
    var buffer = new DataView(new ArrayBuffer(512));
    var len = 0;

    it('to buffer (Util.CharacterString::encode)', () => {
        var ctx = { offset: 0 };

        Object.keys(fixtures).forEach((s) => {
            Util.CharacterString.encode(buffer, ctx, s);
            len += fixtures[s].length + 1; // chars bytes + length byte
        });

        expect(ctx.offset).toBe(len);
    })

    it('from buffer (Util.CharacterString::parse)', () => {
        var ctx = { offset: 0 };
        var strings = Object.keys(fixtures);
        var i = 0;

        while(ctx.offset < len) {
            expect(Util.CharacterString.parse(buffer, ctx)).toBe(strings[i++]);
        };

        expect(ctx.offset).toBe(len);
    })
});

describe('Handle DNS domains (with compression)', () => {
    var buffer = new DataView(new ArrayBuffer(512));
    var len = 0;
    var domains = [
        [
            'domain.tld',
            12                      // 9 chars + 2 length bytes + 1 null byte
        ],
        [
            'www.domain.tld',
            6                       // 3 chars + 1 length byte + 2 pointer bytes
        ],
        [
            'foobar.www.domain.tld',
            9                       // 6 chars + 1 length byte + 2 pointer bytes
        ],
        [
            'domain.tld',
            2,                      // 2 pointer bytes
            0                       // Pointer pos
        ]
    ]

    it('to buffer (Util.DomainName::encode)', () => {
        var ctx = { offset: 0 };

        domains.forEach((d) => {
            var pos = ctx.offset;

            Util.DomainName.encode(buffer, ctx, d[0]);

            len += d[1];

            expect(ctx.pointers[d[0]]).toBe(d[2] !== undefined ? d[2] : pos)

            expect(ctx.offset).toBe(len);
        });
    })

    it('from buffer (Util.DomainName::parse)', () => {
        var ctx = { offset: 0 };
        var i = 0;

        while(ctx.offset < len) {
            expect(Util.DomainName.parse(buffer, ctx)).toBe(domains[i++][0]);
        };

        expect(ctx.offset).toBe(len);
    })
});

describe('Handle DNS addresses', () => {
    var buffer = new DataView(new ArrayBuffer(512));
    var len = 0;
    var addresses = [
        "192.168.0.1",
        "127.0.0.1",
        "0.0.0.0",
        "156.12.183.1"
    ]

    it('to buffer (Util.Address::encode)', () => {
        var ctx = { offset: 0 };

        addresses.forEach((d) => {
            var pos = ctx.offset;

            Util.Address.encode(buffer, ctx, d);

            len += 4;

            expect(ctx.offset).toBe(len);
        });
    })

    it('from buffer (Util.Address::parse)', () => {
        var ctx = { offset: 0 };
        var i = 0;

        while(ctx.offset < len) {
            expect(Util.Address.parse(buffer, ctx)).toBe(addresses[i++]);
        };

        expect(ctx.offset).toBe(len);
    })
});
