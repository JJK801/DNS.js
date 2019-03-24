function stringToBytes (buffer, ctx, str) {
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);

        if (charcode < 0x80) {
            Uint.encode(buffer, ctx, 8, charcode);
        } else if (charcode < 0x800) {
            Uint.encode(buffer, ctx, 8, 0xc0 | (charcode >> 6));
            Uint.encode(buffer, ctx, 8, 0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            Uint.encode(buffer, ctx, 8, 0xe0 | (charcode >> 12));
            Uint.encode(buffer, ctx, 8, 0x80 | ((charcode>>6) & 0x3f));
            Uint.encode(buffer, ctx, 8, 0x80 | (charcode & 0x3f));
        }
    }
}

function bytesToString (buffer, ctx, count)
{
    var str = '';

    while (str.length < count) {
        var value = Uint.parse(buffer, ctx, 8);

        if (value < 0x80) {
            str += String.fromCharCode(value);
        } else if (value > 0xBF && value < 0xE0) {
            str += String.fromCharCode((value & 0x1F) << 6 | Uint.parse(buffer, ctx, 8) & 0x3F);
        } else if (value > 0xDF && value < 0xF0) {
            str += String.fromCharCode((value & 0x0F) << 12 | (Uint.parse(buffer, ctx, 8) & 0x3F) << 6 | Uint.parse(buffer, ctx, 8) & 0x3F);
        }
    }

    return str;
}

module.exports.Uint = Uint = {
    encode: function (buffer, ctx, length, data) {
        buffer["setUint" + length](ctx.offset, data);

        ctx.offset += length / 8;
    },
    parse: function (buffer, ctx, length) {
        var data = buffer["getUint" + length](ctx.offset);

        ctx.offset += length / 8;

        return data;
    }
}

module.exports.CharacterString = CharacterString = {
    encode: function(buffer, ctx, str) {
        Uint.encode(buffer, ctx, 8, str.length);

        stringToBytes(buffer, ctx, str);
    },
    parse: function(buffer, ctx) {
        return bytesToString(buffer, ctx, Uint.parse(buffer, ctx, 8));
    }
}

module.exports.DomainName = DomainName = {
    encode: function(buffer, ctx, str) {
        var arr = str.split(".");
        ctx.pointers = ctx.pointers || {};

        for (var i in arr) {
            var part = arr.slice(i).join('.');
            var pointer = ctx.pointers[part];

            if (pointer !== undefined) { // Domain repetition
                Uint.encode(buffer, ctx, 16, pointer | 0xC000);
                return;
            }

            if (i < (arr.length - 1)) { // Register pointer
                ctx.pointers[part] = ctx.offset;
            }

            CharacterString.encode(buffer, ctx, arr[i])
        }

        if (str.length) {
            Uint.encode(buffer, ctx, 8, 0);
        }
    },
    parse: function(buffer, ctx) {
        var str = "";
        var len;

        while (len = buffer.getUint8(ctx.offset)) {
            if (str.length) {
                str += ".";
            }

            if (len >= 0xc0) { // Pointer
                return str + DomainName.parse(buffer, { offset: Uint.parse(buffer, ctx, 16) & 0x3FFF });
            }

            str += CharacterString.parse(buffer, ctx);
        }

        if (str.length) {
            ctx.offset++;
        }

        return str;
    }
};

module.exports.Address = Address = {
    parse: function (buffer, ctx) {
        var arrAddress = [];

        for (var i = 0; i < 4; i++) {
            arrAddress.push(Uint.parse(buffer, ctx, 8));
        }

        return arrAddress.join('.');
    },
    encode: function (buffer, ctx, data) {
        data.split('.').forEach(function (n) {
            Uint.encode(buffer, ctx, 8, parseInt(n, 10))
        });
    }
}
