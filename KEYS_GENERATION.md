# Генерація ключів для шифрування

Для генерації безпечних ключів використовуйте наступні команди:

## Згенерувати ENCRYPTION_KEY
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Згенерувати JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Налаштування

1. Скопіюйте `.env.example` в `.env.local`
2. Згенеруйте ключі використовуючи команди вище
3. Вставте згенеровані ключі у відповідні поля `.env.local`

## Важливо

⚠️ **Ніколи не публікуйте файл `.env.local` у Git!**

Він вже додано до `.gitignore`.
