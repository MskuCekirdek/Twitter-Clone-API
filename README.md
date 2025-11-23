# Twitter API

Express, Prisma ve PostgreSQL ile yazılmış basit bir Twitter klonu API'si. JWT tabanlı kimlik doğrulama, kullanıcı profili, takip sistemi, gönderi/paylaşım (repost), beğeni, yorum ve mention desteği içerir.

## Kullandığımız Paketler (Özet)
- `express`: HTTP sunucusu ve routing.
- `cors`: Cross-origin istekler için CORS desteği.
- `dotenv`: .env dosyasından ortam değişkenlerini yükler.
- `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg`: PostgreSQL veritabanı erişimi ve ORM.
- `jsonwebtoken`: JWT üretimi ve doğrulaması.
- `bcrypt`: Parola hashleme ve karşılaştırma.
- `nodemon` (dev): Geliştirme sırasında otomatik restart.

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
- Base URL: `http://localhost:3000`
- Header: `Content-Type: application/json`
- Kimlik doğrulama: `Authorization: Bearer <JWT>`
- Health check: `GET /health` (DB gecikmesi dahil sistem bilgisi döner)

## Response Türleri
- Başarılı (200/201):
```json
{ "status": "success", "message": "OK", "data": { } }
```
- Hata (400/404/500):
```json
{ "status": "error", "message": "Error", "errors": null }
```
- 401: `{ "status": "error", "message": "Authorization header missing" | "Token not provided" | "Invalid or expired token" }`
- 404: `{ "status": "error", "message": "Not Found" }`
- 422 (doğrulama için hazır): `{ "status": "error", "message": "Validation Failed", "errors": [ ... ] }`

## Endpointler ve Örnek İstek/Cevaplar
Örneklerde global Axios ayarı kullanıldı:
```js
import axios from "axios";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.headers.common["Content-Type"] = "application/json";
```

### Health
**GET /health**  
Başarılı 200:
```json
{
  "status": "success",
  "message": "API is fully operational",
  "data": {
    "service": "twitter_api",
    "environment": "development",
    "uptime": 123.45,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "versions": { "node": "v18.x", "api": "1.0.0" },
    "system": { "platform": "darwin", "arch": "arm64" },
    "database": { "status": "connected", "latencyMs": 5 },
    "status": "operational"
  }
}
```

### Auth
**POST /auth/register**  
İstek:
```js
await axios.post("/auth/register", {
  email: "a@b.com",
  username: "alice",
  password: "secret",
});
```
Başarılı 201:
```json
{
  "status": "success",
  "message": "User registered",
  "data": {
    "user": { "id": "uuid", "email": "a@b.com", "username": "alice", "avatarUrl": null, "createdAt": "2024-01-01T10:00:00.000Z" },
    "token": "jwt-token"
  }
}
```
Hata 400 (email veya username varsa):
```json
{ "status": "error", "message": "Email already exists" }
```

**POST /auth/login**  
İstek:
```js
const loginRes = await axios.post("/auth/login", {
  email: "a@b.com",
  password: "secret",
});
const token = loginRes.data.data.token;
axios.defaults.headers.common.Authorization = `Bearer ${token}`;
```
Başarılı 200:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { "id": "uuid", "email": "a@b.com", "username": "alice" },
    "token": "jwt-token"
  }
}
```
Hata 400:
```json
{ "status": "error", "message": "Invalid email or password" }
```

### Kullanıcılar (`/users`)
**GET /users/me** (Auth)  
```js
const me = await axios.get("/users/me");
```
Başarılı 200:
```json
{
  "status": "success",
  "message": "User loaded",
  "data": {
    "id": "uuid",
    "email": "a@b.com",
    "username": "alice",
    "bio": { "bio": "Merhaba" },
    "followers": [ { "followerId": "..." } ],
    "following": [ { "followingId": "..." } ]
  }
}
```
401:
```json
{ "status": "error", "message": "Authorization header missing" }
```

**GET /users/:username**  
```js
const profile = await axios.get("/users/alice");
```
Başarılı 200: profil ve son postlar
```json
{
  "status": "success",
  "message": "Profile loaded",
  "data": {
    "id": "uuid",
    "username": "alice",
    "bio": { "bio": "Merhaba" },
    "followers": [],
    "following": [],
    "posts": [ { "id": "post-uuid", "content": "hi", "createdAt": "..." } ]
  }
}
```
404:
```json
{ "status": "error", "message": "User not found" }
```

**PUT /users/update** (Auth)  
```js
await axios.put("/users/update", {
  firstName: "Alice",
  lastName: "Doe",
  avatarUrl: "https://img",
});
```
Başarılı 200:
```json
{ "status": "success", "message": "Profile updated", "data": { "firstName": "Alice", "lastName": "Doe", "avatarUrl": "https://img" } }
```

**PUT /users/bio** (Auth)  
```js
await axios.put("/users/bio", {
  bio: "Merhaba",
  location: "TR",
  website: "https://site",
  birthday: "1990-01-01",
});
```
Başarılı 200:
```json
{ "status": "success", "message": "Bio updated", "data": { "bio": "Merhaba", "location": "TR", "website": "https://site", "birthday": "1990-01-01T00:00:00.000Z" } }
```

**POST /users/follow/:username** (Auth)  
```js
await axios.post("/users/follow/bob");
```
Başarılı 200: `{ "status":"success","message":"User followed","data":{"followerId":"...","followingId":"..."}}`  
Hata 400: `"You cannot follow yourself"` veya `"Already following"`

**POST /users/unfollow/:username** (Auth)  
Başarılı 200: `{ "status":"success","message":"User unfollowed","data":{"count":1}}`

**GET /users/check-username?username=foo**  
```js
const usernameCheck = await axios.get("/users/check-username", {
  params: { username: "foo" },
});
```
Başarılı 200:
```json
{ "status": "success", "message": "Username checked", "data": { "username": "foo", "available": true } }
```

### Postlar (`/posts`)
**POST /posts/create** (Auth)  
```js
await axios.post("/posts/create", { content: "Merhaba @bob" });
```
Başarılı 201:
```json
{ "status": "success", "message": "Post created", "data": { "id": "post-uuid", "content": "Merhaba @bob", "authorId": "user-uuid", "mentionUsernames": ["bob"] } }
```

**GET /posts/:id**  
Başarılı 200: `{ "status":"success","message":"Post loaded","data":{ "id":"...", "author":{...}, "likes":[...], "comments":[...], "reposts":[...] } }`  
404: `{ "status":"error","message":"Post not found" }`

**DELETE /posts/delete/:id** (Auth)  
Başarılı 200: `{ "status":"success","message":"Post deleted","data":{} }`  
Hata 400: `"Unauthorized to delete"`

**POST /posts/like/:id** (Auth)  
Başarılı 200: `{ "status":"success","message":"Post liked","data":{"liked":true} }`

**POST /posts/unlike/:id** (Auth)  
Başarılı 200: `{ "status":"success","message":"Post unliked","data":{} }`

**POST /posts/repost/:id** (Auth)  
Başarılı 200: `{ "status":"success","message":"Post reposted","data":{"reposted":true} }`

**POST /posts/unrepost/:id** (Auth)  
Başarılı 200: `{ "status":"success","message":"Repost removed","data":{} }`

**GET /posts/feed/me** (Auth)  
Başarılı 200:
```json
{
  "status": "success",
  "message": "Feed loaded",
  "data": [
    { "id": "post-uuid", "content": "hi", "author": { "username": "alice" }, "likes": [], "comments": [], "reposts": [] }
  ]
}
```

### Yorumlar (`/comment`)
**POST /comment/create** (Auth)  
```js
await axios.post("/comment/create", {
  postId: "post-uuid",
  content: "Güzel",
});
```
Başarılı 201:
```json
{ "status": "success", "message": "Comment created", "data": { "id": "comment-uuid", "postId": "post-uuid", "content": "Güzel", "user": { "id": "user-uuid" } } }
```
Hata 400: `{ "status": "error", "message": "Content cannot be empty" }`

**GET /comment/:id**  
Başarılı 200: `{ "status":"success","message":"Comment loaded","data":{ "id":"...", "content":"...", "user":{...}, "post":{...} } }`  
404: `{ "status":"error","message":"Comment not found" }`

**DELETE /comment/delete/:id** (Auth)  
Başarılı 200: `{ "status":"success","message":"Comment deleted","data":{} }`  
Hata 400: `"Unauthorized to delete"`

**GET /comment/post/:postId**  
Başarılı 200:
```json
{
  "status": "success",
  "message": "Comments loaded",
  "data": [
    { "id": "comment-uuid", "content": "Güzel", "user": { "username": "alice" }, "createdAt": "..." }
  ]
}
```

## Kısa Örnek Akış
```js
// 1) Register
await axios.post("/auth/register", {
  email: "a@b.com",
  username: "alice",
  password: "secret",
});

// 2) Login
const login = await axios.post("/auth/login", {
  email: "a@b.com",
  password: "secret",
});
axios.defaults.headers.common.Authorization = `Bearer ${login.data.data.token}`;

// 3) Post oluştur
await axios.post("/posts/create", { content: "Merhaba @bob" });

// 4) Akış
const feed = await axios.get("/posts/feed/me");
console.log(feed.data);
```

## Notlar
- JWT doğrulaması `Authorization` header’ındaki `Bearer <token>` değerini kullanır.
- Beğeni, repost ve yorum işlemleri Prisma transaction ile sayaçları (likeCount, repostCount, commentCount) günceller.
- Mention edilen kullanıcılar `mention` tablosunda saklanır; post içinde `mentionUsernames` listesi tutulur.
