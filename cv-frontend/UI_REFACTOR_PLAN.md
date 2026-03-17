# UI Refactor Plan - CV Builder

## 1) Muc tieu tong quat
- Nhan dien thuong hieu ro rang, hien dai, de nho.
- Tang ti le click vao CTA chinh tren trang chu (`/templates`, `/editor`).
- Dong bo trai nghiem giua Homepage, Templates, Editor, My CVs.
- Uu tien toc do tai trang va kha nang su dung tren mobile.
- Khong trien khai module Social Proof (testimonials, review, so lieu nguoi dung).

## 2) Nguyen tac thiet ke
- Visual direction: clean-tech, sang, do tuong phan cao, gradient nhe.
- Typography: su dung he font hien tai de dong bo, toi uu hierarchy tieu de/noi dung.
- Motion: animation co muc dich (hero reveal, hover card, card entrance), tranh lam dung.
- Component-first: tach section lon thanh component tai su dung duoc.
- Accessibility: focus ring ro, contrast dat nguong, semantic heading dung thu tu.

## 3) Pham vi refactor

### A. Homepage (`src/app/page.tsx`)
- Hero moi voi thong diep manh, CTA kep, trust chips ve tinh nang (khong phai social proof).
- Mockup khu vuc ben phai mo phong editor + ket qua PDF.
- Section "Template Highlights" hien 4 mau tieu bieu co nut hanh dong nhanh.
- Section "Feature Bento" trinh bay tinh nang bang block lon/nho truc quan.
- Section "Quy trinh 3 buoc" toi gian, de quet tren mobile.
- CTA cuoi trang manh hon, ro huong dieu huong chinh.

### B. Templates page (`src/app/templates/page.tsx`)
- Toi uu hero, bo loc va tim kiem de de su dung hon.
- Tang do noi bat cho category active.
- Cai thien spacing/card rhythm cho man hinh nho.

### C. Editor + My CVs
- Editor: nhan manh hierarchy giua canvas va panel dieu khien.
- My CVs: bo tri card de doc, thao tac nhanh (rename/duplicate/export).
- Dong bo style button, card radius, border va shadow.

## 4) Ke hoach trien khai theo giai doan

### Giai doan 1 - Homepage overhaul (uu tien cao)
1. Refactor layout trang chu thanh cac khoi section ro rang.
2. Them card visual va gradient background co chieu sau.
3. Dua "Template Highlights" va "Feature Bento" vao luong ke chuyen.
4. Kiem tra responsive desktop/tablet/mobile.

### Giai doan 2 - Design consistency
1. Chuan hoa spacing tokens, radius, shadow, border opacity.
2. Chuan hoa style CTA chinh/phu tren toan site.
3. Chuan hoa heading scale va khoang cach theo section.

### Giai doan 3 - Templates, Editor, My CVs
1. Nang cap bo loc/tim kiem trang templates.
2. Cai thien editor shell va panel grouping.
3. Cai thien danh sach CV cua toi, toi uu flow thao tac.

## 5) Tieu chi chap nhan (acceptance criteria)
- Homepage moi co bo cuc ro, visual manh, CTA de thay, khong co Social Proof.
- Hoat dong on tren >= 3 breakpoints: mobile, tablet, desktop.
- Khong tao loi TypeScript/ESLint moi o cac file thay doi.
- Khong lam giam trai nghiem dark mode.
- Lighthouse Performance va Best Practices khong giam dang ke.

## 6) Test va xac thuc
- Manual test: luot trang, hover, click CTA, dark/light mode.
- Smoke test: vao `/`, `/templates`, `/editor`, `/my-cvs`.
- Chup snapshot bang Playwright de doi chieu giao dien truoc/sau.

## 7) Risk va giai phap
- Risk: hero qua nang do hieu ung -> giam effect, uu tien paint nhe.
- Risk: card qua day thong tin tren mobile -> bo cuc stack, an bot chip phu.
- Risk: style lech voi trang cu -> dung lai bien mau, radius va utility hien co.

## 8) Deliverables
- Homepage da refactor (khong co social proof).
- File plan nay duoc cap nhat xuyen suot qua tung giai doan.
- Bao cao ngan gon ve ket qua kiem tra bang Playwright.
