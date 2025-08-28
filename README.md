# LLTShop.vn – Affiliate Platform cho KOL/KOC

🚀 **LLTShop.vn** là nền tảng hỗ trợ **KOL/KOC quản lý và quảng bá sản phẩm affiliate**.  
Người dùng có thể đăng sản phẩm, tìm kiếm theo từ khóa, và tận dụng AI để tự động sinh nội dung quảng bá.

---

## 🌐 Demo
👉 [Website chính thức](https://lltshop.vn)

---

## 🛠️ Công nghệ sử dụng
- **Frontend:** React (App Router), Next.js, TypeScript, TailwindCSS  
- **Backend:** Node.js, Express.js, REST API  
- **Database:** MongoDB  
- **AI Integration:** API sinh caption & mô tả sản phẩm  
- **Triển khai:** Vercel Hosting  

---

## ✨ Chức năng nổi bật
- 📝 Đăng & quản lý sản phẩm, phân loại theo danh mục  
- 📢 Tự động đăng bài lên **Fanpage Facebook** khi tạo sản phẩm mới  
- 🔍 Tìm kiếm sản phẩm nhanh theo từ khóa  
- 🤖 **AI hỗ trợ sinh caption & mô tả sản phẩm**  
- 🔑 Đăng nhập Admin (Auth) + **Google reCAPTCHA** bảo mật  
- 💬 Feedback từ người dùng để cải thiện sản phẩm  

---

## 📂 Cấu trúc thư mục
```plaintext
src/
 ├─ app/                          # Next.js App Router (pages & APIs)
 │   ├─ admin/                    # Trang quản trị
 │   │   ├─ categories/           # CRUD danh mục
 │   │   │   ├─ [slug]/page.tsx
 │   │   │   ├─ edit/[id]/page.tsx
 │   │   │   └─ new/page.tsx
 │   │   ├─ products/             # CRUD sản phẩm
 │   │   │   ├─ [id]/page.tsx
 │   │   │   ├─ edit/[id]/page.tsx
 │   │   │   └─ new/page.tsx
 │   │   ├─ login/page.tsx        # Đăng nhập admin
 │   │   ├─ layout.tsx            # Layout cho admin
 │   │   └─ page.tsx              # Dashboard admin
 │   │
 │   ├─ api/                      # API routes (REST endpoints)
 │   │   ├─ ai/generate-description/route.ts
 │   │   ├─ auth/[...nextauth]/route.ts
 │   │   ├─ categories/[id]/route.ts
 │   │   │            └─ route.ts
 │   │   ├─ feedback/route.ts
 │   │   ├─ generate-caption/route.ts
 │   │   ├─ products/[id]/categories/route.ts
 │   │   │               └─ route.ts
 │   │   └─ products/route.ts
 │   │
 │   ├─ auth/unauthorized/page.tsx
 │   ├─ favicon.ico
 │   ├─ globals.css
 │   ├─ layout.tsx                # Layout chính
 │   └─ page.tsx                  # Trang chủ
 │
 ├─ component/                    # UI components tái sử dụng
 │   ├─ admin/
 │   │   ├─ AuthGate.tsx
 │   │   ├─ CategoryTable.tsx
 │   │   ├─ EditProductForm.tsx
 │   │   └─ ProductTable.tsx
 │   ├─ CategoryFilter.tsx
 │   ├─ FeedBackForm.tsx
 │   ├─ HomePageClient.tsx
 │   ├─ HomeWrapper.tsx
 │   ├─ LoadingSkeleton.tsx
 │   ├─ PaginationControls.tsx
 │   ├─ ProductCart.tsx
 │   ├─ ProductFilter.tsx
 │   ├─ ProductModel.tsx
 │   ├─ ProductList.tsx
 │   └─ SearchBar.tsx
 │
 ├─ lib/                          # Logic nghiệp vụ & helper
 │   ├─ models/
 │   │   ├─ Category.ts
 │   │   ├─ Feedback.ts
 │   │   ├─ PostHistory.ts
 │   │   └─ Product.ts
 │   ├─ services/
 │   │   └─ FacebookPoster.ts
 │   ├─ api-helper.ts
 │   ├─ authOptions.ts
 │   ├─ converters.ts
 │   ├─ db.ts
 │   └─ mongodb.ts
 │
 ├─ types/                        # Kiểu dữ liệu TypeScript
 │   ├─ next-auth.d.ts
 │   └─ product.ts
