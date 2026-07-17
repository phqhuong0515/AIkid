# StoryMee × AIkid — Xưởng Sáng Tạo

Nhánh này chứa code app mới **AIkidApp** (Expo) + patch HTML prototype để owner review.

## Cấu trúc

| Path | Mô tả |
|------|--------|
| `AIkidApp/` | App Expo 54: auth parent, family (hồ sơ con), lobby, character, Gateway media/jobs |
| `docs/DESIGN_AIKID_FEATURE_REFACTOR.md` | Design refactor chi tiết |
| `SVG/`, `new-lobby-page/` | Prototype HTML (đã patch nav + art gen qua Gateway) |

## Chạy AIkidApp

```bash
cd AIkidApp
cp .env.example .env
npm install
# Mee assets: symlink public/mee → ../SVG
ln -sfn ../SVG public/mee
ln -sfn ../SVG public/mee-html
npx expo start --web --port 8082
```

## Auth / API (chuẩn StoryMee Mobile)

- Login: `POST /internal/v1/account/login` (Gateway → core-account-api)
- Family children: `/internal/v1/account/family/*`
- Gen ảnh: `POST /internal/v1/media/upload` + `POST /internal/v1/jobs` (provider `google-native`)

## Monorepo (nếu có quyền storymeedev/storymee)

Cùng commit cũng có trên:
- `feat/xuong-sang-tao`
- `feat/aikid-xuong-sang-tao-app`
