# Backpack 交易所日交易脚本

## 初始步骤

Backpack 交易所注册：[Refer code: mvp](https://backpack.exchange/refer/mvp)，通过 [kyc 认证](https://x.com/Abao_backpack/status/1823966202244554865)

在交易所设置页面创建 API Keys

在账户中存放 USDC

## 运行命令：

运行<code>git clone https://github.com/Scotthamy/backpack_exchange</code>把代码克隆到本地服务器

先运行 <code>npm install</code>

在根目录新建<code>.env</code>文件，并根据<code>.env.example</code>文件中内容的格式填写 apisecret 及 apikey

另请重点关注<code>index.js</code>文件中<code>dailyTrade</code>函数内容的中文备注

运行 <code>npm start</code>

## 个人建议

只交易 Sol

API Keys 等信息做好保护，定期更换
