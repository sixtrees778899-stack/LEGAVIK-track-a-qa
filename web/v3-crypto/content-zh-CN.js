export const zhCN=Object.freeze({
  brand:'CJAS',product:'资产与账户',productEn:'Assets & Accounts',homeEyebrow:'长期资产与恢复管理',homeTitle:'为重要资产留下清晰、可信的恢复路径',homeLead:'从加密资产开始，建立一份由你掌控、可独立恢复的长期资产地图。',openCrypto:'进入加密资产',available:'当前可用',coming:'规划中',back:'返回',continue:'保存并继续',dashboard:'资产总览',addAsset:'添加资产或账户',custom:'自定义',assetsTitle:'加密资产',assetsLead:'按类型整理账户、钱包与链上头寸。所有内容最终汇入同一个恢复版本。',mapTitle:'Crypto Recovery Map',mapLead:'补充恢复说明和辅助文件。不要填写密码、私钥、助记词或验证码。',readiness:'Recovery Readiness',createVersion:'创建并保护我的恢复版本',files:'文件',capacity:'容量',recoveryNote:'恢复说明与线索',addFiles:'添加附件',remove:'移除',noFiles:'尚未添加附件',paymentTitle:'保护你的恢复版本',paymentLead:'付款将在你完成Recovery Map、确认准备度并创建受保护版本时发生。当前体验版不执行真实支付。',service:'CJAS Service',paymentPending:'REAL PAYMENT INTEGRATION · NOT STARTED',continueDemo:'继续创建体验版本',passwordTitle:'设置Recovery Password',passwordLead:'该密码只在当前浏览器用于本地加密。CJAS无法找回，请妥善保存。',password:'Recovery Password',passwordAgain:'再次输入',safetyAck:'我理解CJAS无法找回此密码，并确认附件不含私钥、助记词、完整密码或验证码。',prepare:'创建安全恢复版本',saveKit:'保存 Recovery Kit',saveBackup:'保存本地加密备份（可选）',store:'开始永久存储',saveEvidence:'保存 Mainnet Recovery Evidence',complete:'恢复版本已创建',recoveryEntry:'进入独立恢复',recoverTitle:'恢复全部文件',recoverLead:'只需要同一次创建的恢复材料和Recovery Password。',evidence:'Mainnet Recovery Evidence',kit:'Recovery Kit',recoverPassword:'Recovery Password',recoverAction:'开始恢复',saveAll:'保存全部恢复文件',emptyAssets:'还没有Crypto资产。先选择一个分类并添加资产。',technicalHidden:'技术细节已由CJAS安全处理',statusReady:'准备就绪',statusNeedsNote:'需要补充恢复说明',statusNeedsFile:'建议添加辅助文件',fileLimit:'累计附件容量不得超过50 MiB。',invalidMaterials:'恢复材料不匹配或无法识别。',recoveryDone:'全部文件恢复成功',paymentMethods:'未来支持 Card · Apple Pay · Google Pay · PayPal · Bank Transfer'
});

export const assetModules=Object.freeze([
  {id:'crypto',zh:'加密资产',en:'Crypto Assets',available:true},
  {id:'identity',zh:'数字身份',en:'Digital Identity'},
  {id:'banking',zh:'银行与现金',en:'Banking & Cash'},
  {id:'investments',zh:'投资与财富',en:'Investments & Wealth'},
  {id:'business',zh:'商业与线上资产',en:'Business & Online Assets'},
  {id:'legal',zh:'保险与法律',en:'Insurance & Legal'},
  {id:'property',zh:'重要文件与财产',en:'Documents & Property'},
  {id:'people',zh:'恢复与可信联系人',en:'Recovery & Trusted People'}
]);

export const cryptoCategories=Object.freeze([
  {id:'cex',zh:'中心化交易平台',en:'Centralized Exchanges',brands:['Binance','OKX','Coinbase']},
  {id:'hot-wallet',zh:'热钱包',en:'Hot Wallets',brands:['MetaMask','Trust Wallet','Phantom','Rabby']},
  {id:'hardware',zh:'冷钱包与硬件钱包',en:'Cold & Hardware Wallets',brands:['Ledger','Trezor','Coldcard','Keystone']},
  {id:'defi',zh:'DeFi / 去中心化协议',en:'DeFi & Decentralized Protocols',brands:['Uniswap','Aave','Lido','Staking','Lending','Liquidity Positions']},
  {id:'multisig',zh:'多签与智能账户',en:'Multisig & Smart Accounts',brands:['Safe']},
  {id:'custom',zh:'其他 / 自定义',en:'Other / Custom',brands:['NFT / Digital Collectibles','Staking / Earn','Other crypto holdings']}
]);
