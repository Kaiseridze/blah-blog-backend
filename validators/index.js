import { body } from "express-validator";

export const loginValidator = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен состоять минимум из 5 символов").isLength({
    min: 5,
  }),
];

export const registerValidator = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен состоять минимум из 5 символов").isLength({
    min: 5,
  }),
  body("fullName", "Укажите имя").isLength({ min: 3 }),
  body("avatarUrl", "Некорректная ссылка").optional().isURL(),
];

export const postCreateValidator = [
  body("title", "Заголовок статьи должен содержать минимум 3 символа").isLength({
    min: 3,
  }).isString(),
  body("text", "Текст статьи должен содержать минимум 5 символов").isLength({
    min: 5,
  }).isString(),
  body("tags", "Неверный формат тэгов").isLength({ min: 3 }).optional().isArray(),
  body("imageUrl", "Некорректная ссылка").optional().isString(),
];
