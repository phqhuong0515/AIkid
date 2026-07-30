# AIKid responsive page skeleton

## Mục tiêu

Mọi route Expo dùng chung một cấu trúc layout cho web, tablet và mobile. Page chỉ
khai báo nội dung và hành vi; safe area, nền, header, vùng cuộn, chiều rộng nội
dung và khoảng cách responsive do shell xử lý.

Nguồn chuẩn:

1. Figma `AIkid Asset` cho hình ảnh, component states và thông số thiết kế.
2. `src/design-system/types.ts` cho contract theme có thể thay thế.
3. `src/ui` cho primitive dùng lại giữa các page.
4. File route chỉ compose feature, không tạo thêm design token hoặc breakpoint.

## Contract màn hình

```text
RootLayout
└── route group
    └── AikidPage
        ├── PageBackground(scene)
        └── SafeArea
            ├── PageHeader (optional/sticky)
            └── PageViewport
                └── ScrollView (optional)
                    └── PageContainer
                        ├── PageHero (optional)
                        ├── PageSection
                        └── PageActions (inline hoặc sticky)
```

`AikidPage` là owner duy nhất của:

- safe-area theo platform;
- keyboard avoidance cho form;
- nền theo `scene`;
- scroll/no-scroll;
- max-width và horizontal gutter;
- header/back/title/right action;
- footer/action bar;
- trạng thái loading, empty và error cấp page.

Page không bọc thêm `SafeAreaView`, `PageBackground` hoặc tự tính horizontal
padding nếu đã nằm trong `AikidPage`.

## Breakpoint và container

React Native không dùng media query làm contract chính. Breakpoint được suy ra
từ `useWindowDimensions()` và trả về semantic mode:

| Mode | Viewport | Gutter | Container | Grid mặc định |
| --- | ---: | ---: | ---: | ---: |
| `compact` | `< 480` | 16 | fluid | 1 cột |
| `mobile` | `480–767` | 20 | fluid | 1 cột |
| `tablet` | `768–1023` | 24 | 720 | 2 cột khi phù hợp |
| `desktop` | `1024–1439` | 32 | 1024 | 2–3 cột |
| `wide` | `>= 1440` | 40 | 1200 | 3–4 cột |

Không dùng `width > 768` riêng lẻ trong route. Layout quyết định bằng capability:

- `isCompact`
- `isTabletUp`
- `isDesktopUp`
- `columns`
- `gutter`
- `contentMaxWidth`

Màn hình nhập liệu/đọc dài dùng container hẹp `720`; gallery/dashboard dùng
`1024` hoặc `1200`. Không kéo text/form full-width trên desktop.

## Token cần bổ sung

Theme hiện đã có màu, font, radius, spacing, shadow và scene asset. Cần đưa các
giá trị layout còn hardcode vào contract:

```ts
layout: {
  breakpoint: { compact: 480, tablet: 768, desktop: 1024, wide: 1440 },
  container: { reading: 720, standard: 1024, wide: 1200 },
  gutter: { compact: 16, mobile: 20, tablet: 24, desktop: 32, wide: 40 },
  headerHeight: { compact: 64, regular: 72 },
  minTouchTarget: 44,
}
```

Quy tắc:

- spacing chỉ theo thang `4, 8, 12, 16, 20, 24, 32, 40, 48`;
- touch target tối thiểu `44 × 44`;
- body text tối thiểu `16` cho luồng dành cho trẻ;
- text/action quan trọng không nằm trong ảnh;
- màu trạng thái phải có icon/text, không truyền nghĩa chỉ bằng màu;
- page hỗ trợ font scaling và landscape, không khóa chiều cao theo viewport.

## API đề xuất

```tsx
<AikidPage
  scene="art"
  title="Xưởng sáng tạo"
  subtitle="Chọn phong cách bé yêu thích"
  backHref="/(app)/art"
  container="wide"
  scroll
  actions={<AikidButton>Tiếp tục</AikidButton>}
>
  <PageSection>
    <ResponsiveGrid minItemWidth={220}>
      {items.map(renderItem)}
    </ResponsiveGrid>
  </PageSection>
</AikidPage>
```

Primitive tối thiểu:

- `AikidPage`
- `PageHeader`
- `PageContainer`
- `PageSection`
- `PageActions`
- `ResponsiveGrid`
- `FormStack`
- `EmptyState`
- `ErrorState`
- `LoadingState`

`ScreenChrome` nên được hấp thụ vào `AikidPage`, không tồn tại song song như một
shell thứ hai. `AppShell` chỉ giữ concern toàn app như account overlay; không
quyết định layout riêng cho một route.

## Responsive behavior theo loại page

### Hub/lobby

- Mobile: hero xếp dọc; card một cột.
- Tablet: hero có thể xếp ngang; card hai cột.
- Desktop: container `1200`; card 3–4 cột nếu nội dung cho phép.
- Artwork trang trí tuyệt đối không được làm tăng vùng cuộn hoặc che CTA.

### Form/wizard

- Container `720`, một cột ở mọi viewport.
- Desktop có thể dùng sidebar preview, nhưng thứ tự đọc và tab vẫn là form trước.
- CTA cuối bước sticky trên mobile; inline bên phải trên desktop.
- Khi keyboard mở, input và validation phải còn nhìn thấy.

### Gallery/library

- Grid dùng `minItemWidth`, không gắn `48%`.
- Mobile 2 cột chỉ khi card vẫn đạt kích thước chạm; nếu không dùng 1 cột.
- Loading, empty, error và pagination nằm trong cùng content container.

### Canvas/creation tool

- Shell không scroll; toolbar và canvas quản lý overflow riêng.
- Mobile: toolbar dưới hoặc sheet.
- Desktop: toolbar cạnh; canvas chiếm phần còn lại.
- Safe area áp dụng cho toolbar/action, không làm co hệ tọa độ canvas ngoài ý muốn.

## Hiện trạng và thứ tự migrate

Audit hiện tại:

- Chỉ `library`, `art/canvas`, `art/video` dùng `ScreenChrome`.
- Chỉ `art/canvas` dùng `useResponsiveLayout`.
- Nhiều route tự dùng `useWindowDimensions`, `SafeAreaView`, `ScrollView` và
  breakpoint `768`.
- Max-width đang lẫn `1024`, `1100`, `1200`; gutter đang hardcode `16`, `20`, `24`.
- `AppShell` và `GlobalHeader` tạo thêm nhánh header ngoài `ScreenChrome`.

Thứ tự triển khai:

1. Thêm layout token và hook semantic mới.
2. Tạo `AikidPage`, `PageContainer`, `PageSection`, `PageActions`,
   `ResponsiveGrid`.
3. Migrate một page đại diện cho mỗi nhóm: `lobby`, `art/canvas`,
   `character/generate-v2`, `gallery`.
4. Chụp so sánh ở `390`, `768`, `1024`, `1440`.
5. Sau khi contract ổn định, migrate các route còn lại theo feature.
6. Xóa `ScreenChrome`, responsive calculation và token hardcode đã không còn dùng.

## Definition of done cho mỗi page

- Không tự tạo breakpoint, max-width, gutter hoặc safe-area.
- Không hardcode màu/font/radius/shadow đã có trong template.
- Hoạt động ở width `320`, `390`, `768`, `1024`, `1440`.
- Không horizontal overflow; landscape không che nội dung hoặc CTA.
- Keyboard không che input/action.
- Touch target đạt tối thiểu `44 × 44`.
- Loading, empty, error và disabled state đầy đủ.
- Web dùng được bằng keyboard; focus nhìn thấy rõ.
- `npm run typecheck` và ít nhất một `expo export` thành công.

## Checklist lấy thông số từ Figma

Khi quyền đọc file Figma hoạt động, ghi nhận theo node/frame thay vì suy đoán:

- frame widths thực tế cho mobile/tablet/desktop;
- grid, margin, gutter và max content width;
- header height, safe-area behavior, sticky actions;
- component variants và interaction states;
- text styles, line-height và truncation;
- variables/styles đang publish;
- aspect ratio/crop rule của ảnh;
- khác biệt có chủ ý giữa web và mobile.

Chỉ sau bước này mới map số đo Figma vào token. Không copy vị trí tuyệt đối của
từng frame sang route.
