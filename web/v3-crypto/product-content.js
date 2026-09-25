export const content=Object.freeze({
  pains:[
    {n:'01',title:'资产入口分散',body:'交易平台、钱包、设备和恢复信息散落在不同位置。'},
    {n:'02',title:'重要信息只有你知道',body:'如果你无法亲自处理，指定的人可能连从哪里开始都不知道。'},
    {n:'03',title:'恢复方式各不相同',body:'不同平台、钱包与资产，需要不同的恢复条件和步骤。'}
  ],
  how:[
    {n:'01',title:'整理',body:'记录重要数字资产及其恢复位置。'},
    {n:'02',title:'保护',body:'将真正需要保存的资料在浏览器本地加密，创建安全恢复版本。'},
    {n:'03',title:'恢复',body:'需要时，使用你保存的恢复材料独立恢复。'}
  ],
  explore:[
    {id:'digital-assets',title:'Digital Assets',zh:'数字资产',body:'从交易平台、钱包到DeFi，建立清晰的资产恢复地图。'},
    {id:'security',title:'Security & Privacy',zh:'安全与隐私',body:'敏感资料在浏览器本地加密，平台不读取恢复密码。'},
    {id:'recovery',title:'Recovery & Succession',zh:'恢复与延续',body:'让未来的你或指定联系人知道从哪里开始。'}
  ],
  faq:[
    {q:'LEGAVIK是云盘或密码管理器吗？',a:'不是。LEGAVIK帮助你建立数字资产恢复路径，并保护恢复所需资料。请勿记录私钥、助记词、OTP或完整密码。'},
    {q:'LEGAVIK能看到我的恢复密码吗？',a:'不能。恢复密码只在当前浏览器用于本地加密，LEGAVIK无法找回。'},
    {q:'我可以独立恢复吗？',a:'可以。使用同一次创建的Recovery Kit、Mainnet Recovery Evidence与Recovery Password，可通过独立恢复入口恢复。'}
  ],
  cryptoCategories:[
    {id:'cex',zh:'中心化交易平台',en:'Centralized Exchanges',brands:['Binance','OKX','Coinbase']},
    {id:'hot-wallet',zh:'热钱包',en:'Hot Wallets',brands:['MetaMask','Trust Wallet','Phantom','Rabby']},
    {id:'hardware',zh:'冷钱包与硬件钱包',en:'Cold & Hardware Wallets',brands:['Ledger','Trezor','Coldcard','Keystone']},
    {id:'defi',zh:'DeFi / 去中心化协议',en:'DeFi & Decentralized Protocols',brands:['Uniswap','Aave','Lido']},
    {id:'multisig',zh:'多签与智能账户',en:'Multisig & Smart Accounts',brands:['Safe']},
    {id:'custom',zh:'其他 / 自定义',en:'Other / Custom',brands:['NFT / Digital Collectibles','Staking / Earn']}
  ]
});
