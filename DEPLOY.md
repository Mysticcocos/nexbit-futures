# NEXBIT — деплой на Netlify

Стек: TanStack Start + React + Postgres. Сборка уже настроена под [Netlify](https://www.netlify.com/).

Временные кабинеты (потом смените пароли):

| Роль | Email | Пароль |
|---|---|---|
| Админ | `admin@nexbit.io` | `NexbitAdmin1` |
| Пользователь | `user@nexbit.io` | `NexbitUser1` |

## 1. База данных

1. Откройте [Neon](https://console.neon.tech) → Create project.
2. Скопируйте `DATABASE_URL` (connection string).

Без Postgres на Netlify данные не сохранятся (функции статические).

## 2. Секрет авторизации

В терминале:

```bash
openssl rand -hex 32
```

Это будет `BETTER_AUTH_SECRET`.

## 3. Запуск на Netlify

Откройте: [https://app.netlify.com/start](https://app.netlify.com/start)

1. Войдите в Netlify.
2. **Import an existing project** → GitHub (или загрузите этот ZIP в репозиторий GitHub и подключите его).
3. Build command: `npm run build`  
   Publish directory: `dist`  
   (уже прописано в `netlify.toml`)
4. **Environment variables** → Add:

| Имя | Значение |
|---|---|
| `DATABASE_URL` | строка из Neon |
| `BETTER_AUTH_URL` | `https://ВАШ-САЙТ.netlify.app` без слэша в конце |
| `BETTER_AUTH_SECRET` | строка из шага 2 |
| `CASHIER_SECRET` | любой длинный пароль для кошелёчного бота |

5. Deploy.

После первого деплоя Netlify даст адрес вида `https://something.netlify.app`.  
Пропишите его в `BETTER_AUTH_URL` и нажмите **Retry deploy** / **Trigger deploy**.

## 4. Свой домен

Netlify → Site → Domain management → Add custom domain.  
DNS у регистратора: CNAME на `your-site.netlify.app`.  
Потом обновите `BETTER_AUTH_URL` на `https://ваш-домен` и сделайте Redeploy.

## GitHub без CLI

1. [github.com/new](https://github.com/new) — создайте пустой репозиторий.
2. Загрузите распакованный ZIP (Add file → Upload files).
3. [app.netlify.com/start](https://app.netlify.com/start) → Import from Git → этот репозиторий.

`VITE_AUTH_ENABLED` **не** ставьте в `false`.
