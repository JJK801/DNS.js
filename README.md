# DNS.js

## Server

@TODO

## Packet

### Properties

| Field       | Type                  | Required | Default | Description |
|-------------|-----------------------|:--------:|---------|-------------|
| id          | `Number`              | :x:      | 0       | ID          |
| flags       | `Number`              | :x:      | 0       | Flags       |
| questions   | `Query.Collection`    | :x:      | []      | QD Records  |
| answers     | `Resource.Collection` | :x:      | []      | AN Records  |
| authorities | `Resource.Collection` | :x:      | []      | NS Records  |
| additional  | `Resource.Collection` | :x:      | []      | AD Records  |

### `Packet.encode() : DataView`

Encode the packet instance into a new buffer.

### `Packet::parse(dataView, ctx) : Packet`

Creates a new Packet instance from the given buffer.

|          | Type       | Required           | Description                     |
|----------|------------|:------------------:|---------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to fill with data        |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process |

### `Packet::headerMask(name) : Number`

Return the bitmask of the flag designated by `name`.

|          | Type       | Required           | Description                     |
|----------|------------|:------------------:|---------------------------------|
| name     | `String`   | :heavy_check_mark: | Name of the target bitmask      |

#### Values

| Name                  | Section  | Mask   | Description |
|-----------------------|----------|--------|-------------|
| `RCODE`               | `RCODE`  | 0xF    |             |
| `RECURSION_AVAILABLE` | `RA`     | 0x80   |             |
| `RECURSION_DESIRED`   | `RD`     | 0x100  |             |
| `TRUNCATED`           | `TC`     | 0x200  |             |
| `AUTHORITATIVE`       | `AA`     | 0x400  |             |
| `OPCODE`              | `OPCODE` | 0x7800 |             |
| `RESPONSE`            | `QR`     | 0x8000 |             |

### `Packet.headerValue(name) : Number`

Returns the value of the flag designated by `name`.

#### Values

| Name                  | Section  | Range    | Description |
|-----------------------|----------|----------|-------------|
| `RCODE`               | `RCODE`  | 0 -> 127 |             |
| `RECURSION_AVAILABLE` | `RA`     | 0 -> 1   |             |
| `RECURSION_DESIRED`   | `RD`     | 0 -> 1   |             |
| `TRUNCATED`           | `TC`     | 0 -> 1   |             |
| `AUTHORITATIVE`       | `AA`     | 0 -> 1   |             |
| `OPCODE`              | `OPCODE` | 0 -> 127 |             |
| `RESPONSE`            | `QR`     | 0 -> 1   |             |

## Record (Abstract)

### Properties

| Field       | Type          | Required           | Default | Description |
|-------------|---------------|:------------------:|---------|-------------|
| name        | `String`      | :heavy_check_mark: |         | Name        |
| type        | `Query.Type`  | :heavy_check_mark: |         | Type        |
| class       | `Query.Class` | :heavy_check_mark: |         | Class       |

## Query `extends Record`

### Properties

Same fields as `Record`

## Query::Multicast `extends Query`

### Properties

Same fields as `Query`

| Field           | Type      | Required | Default | Description                        |
|-----------------|-----------|:--------:|---------|------------------------------------|
| unicastResponse | `Boolean` | :x:      | false   | Whether the reply should be unicast|

## Resource `extends Record`

### Properties

Same fields as `Record`

| Field | Type     | Required | Default | Description             |
|-------|----------|:--------:|---------|-------------------------|
| ttl   | `Number` | :x:      | 0       | Record TTL (in seconds) |


## Resource::Multicast `extends Resource`

### Properties

Same fields as `Record`

| Field       | Type      | Required | Default | Description                            |
|-------------|-----------|:--------:|---------|----------------------------------------|
| flushCache  | `Boolean` | :x:      | false   | Whether this record should flush cache |

## Util

### Uint

Encode / Parse DNS unsigned int representation

#### `Util::Uint::encode(dataView, ctx, nbBits, val) : void`

Encode the given value to the buffer at the given offset (`ctx.offset`) with the given size (`nbBits`).

|          | Type       | Required           | Description                       |
|----------|------------|:------------------:|-----------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to fill with data          |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process   |
| nbBits   | `Number`   | :heavy_check_mark: | Amount of bits used for the value |
| val      | `Number`   | :heavy_check_mark: | The number to write               |

#### `Util::Uint::parse(dataView, ctx, nbBits) : integer`

Parse the value with the given size (`nbBits`) next to the given offset (`ctx.offset`) from the buffer.

|          | Type       | Required           | Description                       |
|----------|------------|:------------------:|-----------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to read data from          |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process   |
| nbBits   | `Number`   | :heavy_check_mark: | Amount of bits used for the value |

### CharacterString

Encode / Parse DNS character string representation

| Encoding          | Bytes | Encode             | Parse              |
|-------------------|:-----:|:------------------:|:------------------:|
| ASCII             | 1     | :heavy_check_mark: | :heavy_check_mark: |
| UTF-8             | 2     | :heavy_check_mark: | :heavy_check_mark: |
| UTF-8             | 3     | :heavy_check_mark: | :heavy_check_mark: |

#### `Util::CharacterString::encode(dataView, ctx, str) : void`

Encode the given string to the buffer at the given offset (`ctx.offset`).

|          | Type       | Required           | Description                     |
|----------|------------|:------------------:|---------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to fill with data        |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process |
| str      | `String`   | :heavy_check_mark: | The string to write             |

#### `Util::CharacterString::parse(dataView, ctx) : String`

Parse the string next to the given offset (`ctx.offset`) from the buffer.

|          | Type       | Required           | Description                     |
|----------|------------|:------------------:|---------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to read data from        |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process |

### Address

Encode / Parse DNS address representation

| Feature     | Encode             | Parse              |
|-------------|:------------------:|:------------------:|
| IPV4        | :heavy_check_mark: | :heavy_check_mark: |
| IPV6        | :x:                | :x:                |

#### `Util::Address::encode(dataView, ctx, address) : void`

Encode the given address to the buffer at the given offset (`ctx.offset`).

|          | Type     | Required           | Description                     |
|----------|----------|:------------------:|---------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to fill with data        |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process |
| address  | String   | :heavy_check_mark: | The address to write            |

#### `Util::Address::parse(dataView, ctx) : String`

Parse the address next to the given offset (`ctx.offset`) from the buffer.

Automatically uncompress the address if a pointer is detected.

|          | Type     | Required           | Description                     |
|----------|----------|:------------------:|---------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to read data from        |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process |

### DomainName

Encode / Parse DNS domain representation

| Feature     | Encode             | Parse              |
|-------------|:------------------:|:------------------:|
| Compression | :heavy_check_mark: | :heavy_check_mark: |

#### `Util::DomainName::encode(dataView, ctx, domain) : void`

Encode the given domain to the buffer at the given offset (`ctx.offset`).

Automatically compress the domain if it was previously (fully or partially) added to the buffer.

|          | Type     | Required           | Description                     |
|----------|----------|:------------------:|---------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to fill with data        |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process |
| domain   | String   | :heavy_check_mark: | The domain to write             |

#### `Util::DomainName::parse(dataView, ctx) : String`

Parse the domain next to the given offset (`ctx.offset`) from the buffer.

Automatically uncompress the domain if a pointer is detected.

|          | Type     | Required           | Description                     |
|----------|----------|:------------------:|---------------------------------|
| dataView | `DataView` | :heavy_check_mark: | Buffer to read data from        |
| ctx      | `Object`   | :heavy_check_mark: | State of the buffer r/w process |
