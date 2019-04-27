# Api 接口

## 注册门锁 Api

在一个门锁使用之前要先通过这个 Api 接口在链上注册门锁

**[POST]** `/v1/locks/:id`

- `id` 门锁唯一 Id
- `body` `POST`内容请使用 JSON（请使用**Content-Type: application/json** header)

`body`例子如下：

```json
{
  "state": "register",
  "type": "" // 门锁型号
}
```

如果要注册`type`为`locktype1`, `id`为`1`的锁，curl command 如下：

```bash
curl -X POST -H 'Content-Type: application/json' --data '{"type": "locktype1",  "state": "register"}' /v1/locks/1
```

返回值如下：

```json
// 这里包含了两个transaction
{
  "success": true,
  "data": [
    {
      // 生成门锁类型的transaction
      "name": "domain",
      "trxId": "400154fe46b9a63044d901697250e4f7a868a1079b083baf2ba110e45914c560"
    },
    {
      // 生成门锁的transaction
      "name": "token",
      "trxId": "e2d8cd3c2cb9e0c5c0aade35ed1bb405ff8d7a077e6b747eaaa6ad343b69e388"
    }
  ]
}
```

## 开锁 Api

在门锁注册后，就可以使用本 Api 来进行数据上链
**[POST]** `/v1/locks/:id`

- `id` 门锁唯一 Id
- `body` `POST`内容请使用 JSON（请使用**Content-Type: application/json** header)

`body`例子如下：

```json
{
  "state": "unlock",
  "type": "", // 门锁型号
  "data": "" // 上链数据，非必须，也可以不指定
}
```

如果要开锁`type`为`locktype1`, `id`为`1`，curl command 如下：

```bash
curl -X POST -H 'Content-Type: application/json' --data '{"type": "locktype1",  "state": "unlock"， data: '上链数据'}' /v1/locks/1
```

返回值如下：

```json
{
  "success": true,
  "data": [
    {
      // 开锁的transction
      "name": "unlock",
      "trxId": "281a6730a3062c2eb2ef283df89ea9ab8c2e3bbd2f78cc212d5d23c52195976b"
    },
    {
      // 上链数据transaction，非必须
      "name": "data",
      "trxId": "48f3af32af1005b0b6916c53a172732d3c9284fcbc76a009b03326564c859d9f"
    }
  ]
}
```

## 查看链上 Transaction

当拿到 Transaction Id，就可以调用这个 Api 来得到链上信息。

**[GET]** `/v1/transaction/:id`

得到`281a6730a3062c2eb2ef283df89ea9ab8c2e3bbd2f78cc212d5d23c52195976b`的详细链上信息

```bash
curl /v1/transaction/281a6730a3062c2eb2ef283df89ea9ab8c2e3bbd2f78cc212d5d23c52195976b
```

返回值如下：

```json
{
  "id": "7d378a18dc6fb861d6156cec035b41f33f6f768dab1892bbbe47d3e28bf371e3",
  "signatures": [
    "SIG_K1_KBBaFykAbdwEJrAJUGNjMTuREkigGyRPachXjE3mAE8qTBSG3fagLNorwzihkHx7iHDM3CtqyR6NSm8yHB99YSRzynpVpA"
  ],
  "compression": "none",
  "packed_trx": "65edc35c84475191943640420f000100000020d0d208097d90f7e5e40621001c000000360ec781148621208791280000067768616e6f7401000356e02c14ff34710acb30562723c332e3c791db1e4b06002be8ea1d18bcd924d601000356e02c14ff34710acb30562723c332e3c791db1e4b06002be8ea1d18bcd924d600",
  "transaction": {
    "expiration": "2019-04-27T05:49:25",
    "ref_block_num": 18308,
    "ref_block_prefix": 915706193,
    "max_charge": 1000000,
    "actions": [
      {
        "name": "addmeta",
        "domain": "testType6",
        "key": "5",
        "data": {
          "key": "1556344065478",
          "value": "whanot",
          "creator": "[A] EVT7VVeoJ8h2CtFqR1UBo4H3vbJUuWKrNrqa2LHKerUn27d1sbQNh"
        },
        "hex_data": "0ec781148621208791280000067768616e6f7401000356e02c14ff34710acb30562723c332e3c791db1e4b06002be8ea1d18bcd924d6"
      }
    ],
    "payer": "EVT7VVeoJ8h2CtFqR1UBo4H3vbJUuWKrNrqa2LHKerUn27d1sbQNh",
    "transaction_extensions": []
  },
  "block_num": 7686022,
  "block_id": "00754786b9a6f13b3d5f8a3f9bd8ca54fdd3298de9c95b62dc2f899493ccb6fa"
}
```
