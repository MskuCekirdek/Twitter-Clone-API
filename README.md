# Twitter API

Express, Prisma ve PostgreSQL ile yazılmış basit bir Twitter klonu API'si. JWT tabanlı kimlik doğrulama, kullanıcı profili, takip sistemi, gönderi/paylaşım (repost), beğeni, yorum ve mention desteği içerir.

## Gereksinimler
- Node.js 18+
- PostgreSQL erişimi
- `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT` ortam değişkenleri

## Kurulum
1) Bağımlılıklar  
```bash
npm install
```
2) .env örneği  
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/twitter_api"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
PORT=3000
```
3) Prisma şeması ve DB  
```bash
npx prisma migrate dev
npx prisma generate
```
4) Çalıştırma  
```bash
npm run dev   # nodemon
# veya
npm start
```

## Genel Kullanım
- Base URL: `http://localhost:3001`
- Header: `Content-Type: application/json`
- Kimlik doğrulama: `Authorization: Bearer <JWT>`
- Health check: `GET /health` (DB gecikmesi dahil sistem bilgisi döner)

### Response şekli
Başarılı:
```json
{ "status": "success", "message": "OK", "data": { ... } }
```
Hata:
```json
{ "status": "error", "message": "Error", "errors": null }
```
401 hataları: `Authorization header missing`, `Token not provided`, `Invalid or expired token`

## Endpointler

### Auth
- `POST /auth/register` — Body: `{ email, username, password }` → `{ user: { id, email, username, avatarUrl, createdAt }, token }`
- `POST /auth/login` — Body: `{ email, password }` → `{ user: { id, email, username }, token }`

### Kullanıcılar (`/users`)
- `GET /me` (Auth) — Aktif kullanıcının profili, `bio`, `followers`, `following`
- `GET /:username` — Herkese açık profil; `bio`, `followers`, `following`, `posts` (son eklenen ilk)
- `PUT /update` (Auth) — Body: `{ firstName?, lastName?, avatarUrl? }`
- `PUT /bio` (Auth) — Body: `{ bio?, location?, website?, birthday? }` (`birthday` ISO tarih)
- `POST /follow/:username` (Auth) — Takip et; self-follow ve tekrar follow hata verir
- `POST /unfollow/:username` (Auth) — Takipten çıkar
- `GET /check-username?username=foo` — Kullanıcı adı uygunluğu `{ username, available }`

### Postlar (`/posts`)
- `POST /create` (Auth) — Body: `{ content }`; içerikteki `@username` mention’ları otomatik kaydedilir
- `GET /:id` — Tek post; `author`, `likes`, `comments`, `reposts` dahil
- `DELETE /delete/:id` (Auth) — Sadece sahibi silebilir
- `POST /like/:id` (Auth) — Beğeni ekler ve `likeCount` artırır
- `POST /unlike/:id` (Auth) — Beğeniyi kaldırır ve `likeCount` azaltır
- `POST /repost/:id` (Auth) — Repost ekler ve `repostCount` artırır
- `POST /unrepost/:id` (Auth) — Repost kaldırır ve `repostCount` azaltır
- `GET /feed/me` (Auth) — Takip edilenler + kendin; 50 post, `author/likes/comments/reposts` dahil, yeni→eski

### Yorumlar (`/comment`)
- `POST /create` (Auth) — Body: `{ postId, content }`; `commentCount` artırır
- `GET /:id` — Yorum; `user` ve `post` dahil
- `DELETE /delete/:id` (Auth) — Sadece yorumu oluşturan kullanıcı silebilir; `commentCount` azaltır
- `GET /post/:postId` — Bir posta ait yorum listesi (eski→yeni), `user` bilgisiyle

## Örnek İstek Akışı
```bash
# 1) Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","username":"alice","password":"secret"}'

# 2) Login (token al)
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"secret"}' | jq -r '.data.token')

# 3) Post oluştur
curl -X POST http://localhost:3000/posts/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Merhaba @bob"}'

# 4) Takip et
curl -X POST http://localhost:3000/users/follow/bob \
  -H "Authorization: Bearer $TOKEN"

# 5) Akış
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/posts/feed/me
```

## Notlar
- JWT doğrulaması `Authorization` header’ındaki `Bearer <token>` değerini kullanır.
- Beğeni, repost ve yorum işlemleri Prisma transaction ile sayaçları (likeCount, repostCount, commentCount) günceller.
- Mention edilen kullanıcılar `mention` tablosunda saklanır; post içinde `mentionUsernames` listesi tutulur.
