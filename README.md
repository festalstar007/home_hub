# 345001.xyz

公开的个人导航主页，菜单按“技术、休闲、个人”分类，当前包含博客、游戏、训练记录和订阅记录入口。本仓库不保存私人记录或订阅数据；训练记录与订阅记录由 Cloudflare Access 邮箱验证保护。

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。

## 更新入口

本项目是静态页面，没有网页内编辑后台。菜单配置集中在 `assets/menu.json`。要增删入口，只需修改对应分类的 `items` 数组；没有菜单项的分类不会显示。

顶部分类横向排列；鼠标悬停、键盘聚焦或触屏点击分类时，会展开该分类下的菜单项。

例如：

```json
{
  "categories": [
    {
      "name": "技术",
      "items": [
        {
          "name": "博客",
          "url": "https://blog.345001.xyz/",
          "newTab": true
        }
      ]
    }
  ]
}
```

私有入口可设置 `"requiresAccess": true`，页面会显示锁标识，不显示登录方式说明；真正的访问限制仍由 Cloudflare Access 配置。此公开仓库中的配置文件任何人都能读取，不要在其中填写账号、订阅详情或其他敏感信息。

## Cloudflare Pages

- 连接 GitHub 仓库 `festalstar007/home_hub`，生产分支设为 `main`。
- 构建命令留空，根目录使用仓库根目录；如果控制台要求填写构建输出目录，设为 `.`。
- 绑定自定义域名 `345001.xyz`。
- 配置生产 `pages.dev` 地址重定向到正式域名。

部署配置由 Cloudflare 控制台管理；提交到 `main` 后 Pages 会自动部署。
