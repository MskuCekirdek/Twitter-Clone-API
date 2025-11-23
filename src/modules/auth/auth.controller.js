import * as authService from "./auth.service.js";
import { success, error } from "../../utils/response.js";

export const register = async (req, res) => {
  try {
    const result = await authService.register(req.body);

    return success(
      res,
      "Kullanıcı başarıyla oluşturuldu",
      {
        user: result.user,
        token: result.token,
      },
      201
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);

    return success(res, "Giriş başarılı", {
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    return error(res, err.message, 400);
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return error(res, "Kullanıcı adı gerekli", 400);
    }

    const result = await authService.checkUsername(username);
    return success(res, "Kullanıcı adı kontrol edildi", result);
  } catch (err) {
    return error(res, err.message);
  }
};
