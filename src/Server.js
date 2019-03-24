const dgram = require("dgram");
const EventEmitter = require('events');
const Packet = require('./Packet');

const toArrayBuffer = function (buf) {
    var ab = new ArrayBuffer(buf.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

class Server extends EventEmitter {
    constructor (PacketType) {
        super();

        if (!PacketType) {
            PacketType = Packet;
        }

        Object.defineProperties(
            this,
            {
                _srv: {
                    enumerable: false,
                    writeable: false,
                    value: dgram.createSocket({
                        type: "udp4",
                        reuseAddr: true,
                        recvBufferSize: 5000
                    })
                }
            }
        );

        this._srv.on("message", (data, rinfo) => {
            //console.log(">MEM", JSON.stringify(process.memory()));
            //console.log("MSG", data.length, info.address, info.port);
            try {
                const message = PacketType.parse(new DataView(toArrayBuffer(data)));
                const reply = new PacketType({ id: message.id, flags: Packet.flag("RESPONSE") });

                this.emit(
                    "message",
                    message,
                    reply
                );

                if (reply.questions.length || reply.answers.length || reply.authorities.length || reply.additional.length) {
                    this.send(reply, rinfo);
                }
            } catch (err) {
                console.log("Error", err)
            }
            //console.log("<MEM", JSON.stringify(process.memory()))
        });

        this._srv.on("close", function(data) {
            console.log("s:close", data)
        });

        this.on("message", (message, reply) => {
            message.questions.forEach((question) =>
                this.emit("question", question, reply, message)
            );
            message.answers.forEach((answer) =>
                this.emit("answer", answer, reply, message)
            );
        })
    }

    listen (port) {
        this._srv.bind(port || 53);
    }

    send (packet, rinfo) {
        if (packet instanceof Packet) {
            this._srv.send(new Uint8Array(packet.encode()), rinfo.port, rinfo.address)
        }
    }
}

const mDNSConf = { address: "224.0.0.251", port: 5353 };

class MulticastServer extends Server {
    constructor (ip) {
        super(Packet.Multicast);

        this._srv.on('listening', () => {
            this._srv.addMembership(mDNSConf.address, ip);
        });
    }

    listen () {
        super.listen(mDNSConf.port);
    }

    send (packet, rinfo) {
        if (packet instanceof Packet.Multicast) {
            super.send(packet, packet.unicastResponse ? rinfo : mDNSConf)
        }
    }
}

Server.Multicast = MulticastServer;

module.exports = Server;
